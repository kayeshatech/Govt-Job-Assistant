from datetime import datetime, date
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session

from app.models.exam import GovernmentExam
from app.models.eligibility import QualificationRule, AgeCriteria, AgeRelaxationRule, CommunityDomicileRule
from app.schemas.eligibility import (
    CandidateEligibilityInput,
    CriterionCheckDetail,
    ExamEligibilityResult,
    EligibilityStatusEnum,
)

DEGREE_HIERARCHY = {
    "10+2": 1,
    "Diploma": 2,
    "Undergraduate (Final Year)": 3,
    "Bachelor of Arts (B.A)": 4,
    "Bachelor of Commerce (B.Com)": 4,
    "Bachelor of Science (B.Sc)": 4,
    "Bachelor of Engineering / B.Tech": 4,
    "Bachelor's Degree": 4,
    "Master of Arts (M.A)": 5,
    "Master of Commerce (M.Com)": 5,
    "Master of Science (M.Sc)": 5,
    "Master of Technology (M.Tech)": 5,
    "Master's Degree": 5,
    "Ph.D / Research Scholar": 6,
}

def calculate_age_on_reference_date(dob_str: str, cutoff_date_str: str) -> Optional[int]:
    """Calculate candidate's completed years of age on the specific official reference cutoff date."""
    try:
        dob = datetime.strptime(dob_str, "%Y-%m-%d").date()
        cutoff = datetime.strptime(cutoff_date_str, "%Y-%m-%d").date()
        if dob > cutoff:
            return 0
        age = cutoff.year - dob.year - ((cutoff.month, cutoff.day) < (dob.month, dob.day))
        return age
    except Exception:
        return None

class DeterministicEligibilityEngine:
    """
    Strict, deterministic government recruitment eligibility rules engine.
    Applies statutory gazette conditions without probabilistic or heuristic override.
    """

    @classmethod
    def evaluate_exam(
        cls,
        exam: GovernmentExam,
        candidate: CandidateEligibilityInput,
        db: Optional[Session] = None,
    ) -> ExamEligibilityResult:
        checks: List[CriterionCheckDetail] = []

        # -------------------------------------------------------------
        # 1. AGE & STATUTORY RELAXATION CHECK
        # -------------------------------------------------------------
        age_criteria = exam.age_criteria[0] if exam.age_criteria else None
        
        if not age_criteria:
            # Rule data missing from authoritative table
            checks.append(
                CriterionCheckDetail(
                    criterion_name="Statutory Age Limits",
                    required_condition="Official Commission Age Rule",
                    candidate_value=f"{candidate.age or candidate.date_of_birth or 'Unspecified'}",
                    passed=None,
                    status=EligibilityStatusEnum.INSUFFICIENT_DATA,
                    reason="Authoritative age criteria rule record is missing from the database.",
                    official_rule_citation=exam.official_website,
                )
            )
            relaxation_text = "No rule configured"
        else:
            cutoff_date = age_criteria.cutoff_reference_date
            min_age = age_criteria.min_age
            max_age_general = age_criteria.max_age_general
            clause = age_criteria.official_clause

            # Compute effective age on cutoff date
            effective_age: Optional[int] = None
            if candidate.date_of_birth:
                effective_age = calculate_age_on_reference_date(candidate.date_of_birth, cutoff_date)
            elif candidate.age is not None:
                effective_age = candidate.age

            # Find statutory relaxation for candidate's category
            applicable_relaxation_years = 0
            relaxation_text = "Standard General UR Limit"

            if candidate.is_pwd:
                pwd_rule = next((r for r in age_criteria.relaxations if r.community_category == "PwD"), None)
                if pwd_rule:
                    applicable_relaxation_years = pwd_rule.relaxation_years
                    relaxation_text = f"PwD Relaxation (+{applicable_relaxation_years} Yrs)"
                else:
                    applicable_relaxation_years = 10
                    relaxation_text = "Standard Statutory PwD Relaxation (+10 Yrs)"
            elif candidate.category in ["SC", "ST"]:
                scst_rule = next((r for r in age_criteria.relaxations if r.community_category in ["SC", "ST"]), None)
                if scst_rule:
                    applicable_relaxation_years = scst_rule.relaxation_years
                    relaxation_text = f"SC/ST Statutory Relaxation (+{applicable_relaxation_years} Yrs)"
                else:
                    applicable_relaxation_years = 5
                    relaxation_text = "Standard SC/ST Statutory Relaxation (+5 Yrs)"
            elif candidate.category == "OBC-NCL":
                obc_rule = next((r for r in age_criteria.relaxations if r.community_category == "OBC-NCL"), None)
                if obc_rule:
                    applicable_relaxation_years = obc_rule.relaxation_years
                    relaxation_text = f"OBC-NCL Relaxation (+{applicable_relaxation_years} Yrs)"
                else:
                    applicable_relaxation_years = 3
                    relaxation_text = "Standard OBC-NCL Relaxation (+3 Yrs)"

            max_allowed_age = max_age_general + applicable_relaxation_years

            if effective_age is None:
                checks.append(
                    CriterionCheckDetail(
                        criterion_name="Statutory Age Boundary",
                        required_condition=f"Between {min_age} and {max_allowed_age} years on {cutoff_date} ({relaxation_text})",
                        candidate_value="Not provided",
                        passed=None,
                        status=EligibilityStatusEnum.INSUFFICIENT_DATA,
                        reason="Candidate Date of Birth or completed Age was not supplied.",
                        official_rule_citation=clause,
                    )
                )
            else:
                passed_age = (min_age <= effective_age <= max_allowed_age)
                status_age = EligibilityStatusEnum.MEETS_CRITERIA if passed_age else EligibilityStatusEnum.DOES_NOT_MEET
                
                if effective_age < min_age:
                    reason = f"Candidate age ({effective_age}) is below prescribed minimum of {min_age} years."
                elif effective_age > max_allowed_age:
                    reason = f"Candidate age ({effective_age}) exceeds upper limit of {max_allowed_age} years for {candidate.category}."
                else:
                    reason = f"Age ({effective_age}) is within valid window ({min_age}-{max_allowed_age} yrs as of {cutoff_date})."

                checks.append(
                    CriterionCheckDetail(
                        criterion_name="Statutory Age Boundary",
                        required_condition=f"{min_age} to {max_allowed_age} years as of {cutoff_date} ({relaxation_text})",
                        candidate_value=f"{effective_age} years",
                        passed=passed_age,
                        status=status_age,
                        reason=reason,
                        official_rule_citation=clause,
                    )
                )

        # -------------------------------------------------------------
        # 2. EDUCATIONAL DEGREE LEVEL & SUBJECT STREAM CHECK
        # -------------------------------------------------------------
        qual_rule = exam.qualification_rules[0] if exam.qualification_rules else None

        if not qual_rule:
            checks.append(
                CriterionCheckDetail(
                    criterion_name="Educational Qualification",
                    required_condition=exam.min_qualification_summary,
                    candidate_value=f"{candidate.qualification} ({candidate.major_stream})",
                    passed=None,
                    status=EligibilityStatusEnum.INSUFFICIENT_DATA,
                    reason="Authoritative qualification rule entry is missing for this exam.",
                    official_rule_citation=exam.official_website,
                )
            )
        else:
            required_level = qual_rule.min_degree_level
            req_rank = DEGREE_HIERARCHY.get(required_level, 4)
            cand_rank = DEGREE_HIERARCHY.get(candidate.qualification, 3)

            degree_passed = (cand_rank >= req_rank)
            
            # Check Stream / Subject specificity
            stream_passed = True
            stream_reason = ""
            allowed = qual_rule.allowed_streams or []

            if allowed and "Any" not in allowed and "all" not in [s.lower() for s in allowed]:
                candidate_stream_lower = candidate.major_stream.lower()
                matched = any(s.lower() in candidate_stream_lower for s in allowed)
                if not matched:
                    stream_passed = False
                    stream_reason = f"Stream '{candidate.major_stream}' is not among required disciplines: {', '.join(allowed)}."

            overall_qual_passed = degree_passed and stream_passed
            qual_status = EligibilityStatusEnum.MEETS_CRITERIA if overall_qual_passed else EligibilityStatusEnum.DOES_NOT_MEET

            if not degree_passed:
                qual_reason = f"Degree level '{candidate.qualification}' does not satisfy minimum requirement '{required_level}'."
            elif not stream_passed:
                qual_reason = stream_reason
            else:
                qual_reason = f"Degree ({candidate.qualification}) and stream ({candidate.major_stream}) fulfill the qualification standards."

            checks.append(
                CriterionCheckDetail(
                    criterion_name="Minimum Educational Qualification",
                    required_condition=f"Minimum {required_level} in {', '.join(allowed) if allowed else 'Any Discipline'}",
                    candidate_value=f"{candidate.qualification} in {candidate.major_stream}",
                    passed=overall_qual_passed,
                    status=qual_status,
                    reason=qual_reason,
                    official_rule_citation=qual_rule.official_clause_reference,
                )
            )

            # ---------------------------------------------------------
            # 3. ACADEMIC CUT-OFF MARKS / PERCENTAGE CHECK
            # ---------------------------------------------------------
            min_pct = qual_rule.min_aggregate_percentage
            if min_pct > 0:
                pct_passed = candidate.percentage >= min_pct
                pct_status = EligibilityStatusEnum.MEETS_CRITERIA if pct_passed else EligibilityStatusEnum.DOES_NOT_MEET
                pct_reason = (
                    f"Candidate aggregate score ({candidate.percentage}%) meets prescribed cut-off of {min_pct}%."
                    if pct_passed
                    else f"Candidate aggregate score ({candidate.percentage}%) is below the minimum mandatory cut-off of {min_pct}%."
                )
                checks.append(
                    CriterionCheckDetail(
                        criterion_name="Academic Percentage Threshold",
                        required_condition=f"Minimum {min_pct}% aggregate marks in qualifying degree",
                        candidate_value=f"{candidate.percentage}%",
                        passed=pct_passed,
                        status=pct_status,
                        reason=pct_reason,
                        official_rule_citation=qual_rule.official_clause_reference,
                    )
                )

        # -------------------------------------------------------------
        # 4. NATIONALITY & STATE DOMICILE JURISDICTION CHECK
        # -------------------------------------------------------------
        dom_rule = exam.domicile_rules[0] if exam.domicile_rules else None
        if dom_rule and dom_rule.requires_domicile:
            target_state = dom_rule.target_state or "State"
            is_domiciled = (candidate.domicile_state.lower() == target_state.lower())
            
            if is_domiciled:
                dom_reason = f"Resident of {candidate.domicile_state}; fully eligible for state quota and local reservation benefits."
                dom_status = EligibilityStatusEnum.MEETS_CRITERIA
                dom_passed = True
            else:
                if dom_rule.allows_all_india_candidates:
                    dom_reason = f"Candidate resides in {candidate.domicile_state}. Non-domicile candidates may apply only under General Merit quota."
                    dom_status = EligibilityStatusEnum.MEETS_CRITERIA
                    dom_passed = True
                else:
                    dom_reason = f"Strict state domicile in {target_state} is mandatory for this recruitment."
                    dom_status = EligibilityStatusEnum.DOES_NOT_MEET
                    dom_passed = False

            checks.append(
                CriterionCheckDetail(
                    criterion_name="State Domicile Status",
                    required_condition=f"Domicile in {target_state} for reservation quotas",
                    candidate_value=f"{candidate.domicile_state} Domicile",
                    passed=dom_passed,
                    status=dom_status,
                    reason=dom_reason,
                    official_rule_citation="State Service Rules Article 309",
                )
            )

        # -------------------------------------------------------------
        # 5. OVERALL STATUS DETERMINATION
        # -------------------------------------------------------------
        has_failed = any(c.passed is False for c in checks)
        has_indeterminate = any(c.passed is None for c in checks)

        if has_failed:
            overall_status = EligibilityStatusEnum.DOES_NOT_MEET
            is_eligible = False
        elif has_indeterminate:
            overall_status = EligibilityStatusEnum.INSUFFICIENT_DATA
            is_eligible = False
        else:
            overall_status = EligibilityStatusEnum.MEETS_CRITERIA
            is_eligible = True

        passed_checks_count = sum(1 for c in checks if c.passed is True)
        total_checks_count = len(checks)
        score_pct = int((passed_checks_count / total_checks_count) * 100) if total_checks_count > 0 else 0

        recommendation = (
            "You satisfy all statutory eligibility criteria verified by the official Commission gazette."
            if is_eligible
            else "Candidate does not meet one or more mandatory conditions. Please check detailed reason breakdown."
            if has_failed
            else "Authoritative information or candidate parameters are insufficient to determine eligibility."
        )

        return ExamEligibilityResult(
            exam_id=exam.id,
            exam_code=exam.code,
            exam_title=exam.title,
            conducting_body=exam.authority.name if exam.authority else "Public Commission",
            overall_status=overall_status,
            is_eligible=is_eligible,
            eligibility_score_percentage=score_pct,
            checks=checks,
            age_relaxation_applied=relaxation_text,
            official_source_url=exam.official_website,
            notification_version="2026 Gazetted Release",
            recommendation=recommendation,
        )
