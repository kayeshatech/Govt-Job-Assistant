import apiClient from './client';
import { EligibilityQuery, ExamEligibilityResult } from '../types/eligibility';
import { SAMPLE_EXAMS } from '../fixtures/examsData';
import { ApiResponse } from '../types/common';

export const eligibilityService = {
  /**
   * Screen candidate qualifications using the deterministic backend eligibility engine
   * with graceful fallback to client-side rule evaluation.
   */
  async checkEligibility(query: EligibilityQuery): Promise<ApiResponse<ExamEligibilityResult[]>> {
    try {
      // Approximate birth year from age if raw DOB string isn't present
      const birthYear = new Date().getFullYear() - (query.age || 24);
      const approxDob = `${birthYear}-01-01`;

      const payload = {
        candidate_name: 'Aspirant',
        date_of_birth: approxDob,
        category: query.category || 'General / UR',
        is_pwd: query.isPwD || false,
        domicile_state: query.domicileState || 'Karnataka',
        degree_level: query.qualification.includes('Master')
          ? "Master's Degree"
          : query.qualification.includes('Ph.D')
          ? 'Ph.D'
          : "Bachelor's Degree",
        degree_title: query.qualification,
        stream_discipline: query.stream || 'Computer Science',
        percentage: Number(query.percentage) || 60.0,
      };

      const response = await apiClient.post('/eligibility/check', payload);
      const rawResults = response.data?.data || response.data;

      if (Array.isArray(rawResults) && rawResults.length > 0) {
        const mappedResults: ExamEligibilityResult[] = rawResults.map((r: any) => ({
          examId: r.exam_id,
          examTitle: r.exam_title,
          conductingBody: r.conducting_body,
          isEligible: Boolean(r.is_eligible),
          eligibilityPercentage: typeof r.score_percentage === 'number' ? r.score_percentage : 0,
          checks: (r.criteria_checks || []).map((c: any) => ({
            title: c.criterion_name || 'Criterion Evaluation',
            required: c.prescribed_condition || '',
            candidateValue: c.candidate_value || '',
            passed: Boolean(c.passed),
            notes: c.evaluation_notes || (c.passed ? 'Criterion satisfied' : 'Requirement not met'),
          })),
          ageRelaxationApplied: Array.isArray(r.applicable_relaxations) && r.applicable_relaxations.length > 0
            ? r.applicable_relaxations.join('; ')
            : 'Standard General Age Limit',
          recommendation: r.recommendation_note || (r.is_eligible
            ? 'Fully verified eligible against authoritative gazette criteria.'
            : 'Does not satisfy preliminary conditions for this cadre.'),
        }));

        return {
          data: mappedResults,
          success: true,
          isSampleData: false,
          total: mappedResults.length,
        };
      }
      throw new Error('Empty result from eligibility API');
    } catch {
      // Resilient fallback rule evaluation
      const results: ExamEligibilityResult[] = SAMPLE_EXAMS.map((exam) => {
        const checks = [];
        let totalPassed = 0;
        let totalChecks = 0;

        // 1. Age Check with Reservation Relaxation
        let maxAllowedAge = exam.ageLimit.maxGeneral;
        let relaxationText = 'Standard General UR Age Limit';

        if (query.isPwD) {
          maxAllowedAge = exam.ageLimit.maxPwD;
          relaxationText = 'PwD Relaxation Applied (+10 Years)';
        } else if (query.category === 'SC' || query.category === 'ST') {
          maxAllowedAge = exam.ageLimit.maxSCST;
          relaxationText = 'SC/ST Statutory Relaxation (+5 Years)';
        } else if (query.category === 'OBC-NCL') {
          maxAllowedAge = exam.ageLimit.maxOBC;
          relaxationText = 'OBC-NCL Relaxation Applied (+3 Years)';
        }

        const agePassed = query.age >= exam.ageLimit.min && query.age <= maxAllowedAge;
        checks.push({
          title: 'Age Eligibility Criteria',
          required: `${exam.ageLimit.min} to ${maxAllowedAge} years (${relaxationText})`,
          candidateValue: `${query.age} years old`,
          passed: agePassed,
          notes: agePassed
            ? 'Eligible within age brackets including category relaxation.'
            : query.age < exam.ageLimit.min
            ? 'Candidate below minimum age threshold.'
            : 'Candidate exceeds maximum prescribed age for selected category.',
        });
        totalChecks++;
        if (agePassed) totalPassed++;

        // 2. Education Qualification Check
        let qualPassed = true;
        if (exam.id === 'isro-scientist-sc-2026') {
          qualPassed =
            query.stream.includes('Engineering') ||
            query.stream.includes('B.Tech') ||
            query.qualification.includes('Bachelor of Engineering');
        } else if (exam.id === 'kset-ugc-net-2026') {
          qualPassed =
            query.qualification.includes('Master') ||
            query.qualification.includes('M.Sc') ||
            query.qualification.includes('M.Tech') ||
            query.qualification.includes('M.A') ||
            query.qualification.includes('Ph.D');
        }

        checks.push({
          title: 'Minimum Educational Qualification',
          required: exam.minQualification,
          candidateValue: `${query.qualification} (${query.stream})`,
          passed: qualPassed,
          notes: qualPassed
            ? 'Candidate degree matches prescribed academic qualification stream.'
            : 'Prescribed degree required (e.g., Master degree or specialized B.Tech).',
        });
        totalChecks++;
        if (qualPassed) totalPassed++;

        // 3. Aggregate Percentage / Marks Threshold Check
        let minPct = 50;
        if (exam.id === 'isro-scientist-sc-2026') minPct = 65;
        else if (exam.id === 'rbi-grade-b-2026') {
          minPct = query.category === 'SC' || query.category === 'ST' || query.isPwD ? 50 : 60;
        } else if (exam.id === 'kset-ugc-net-2026') {
          minPct = query.category === 'General / UR' || query.category === 'EWS' ? 55 : 50;
        }

        const pctPassed = query.percentage >= minPct;
        checks.push({
          title: 'Academic Aggregate Percentage Cut-off',
          required: `Minimum ${minPct}% aggregate marks in qualifying exam`,
          candidateValue: `${query.percentage}% aggregate score`,
          passed: pctPassed,
          notes: pctPassed ? 'Satisfies minimum academic cut-off.' : 'Below minimum cut-off percentage.',
        });
        totalChecks++;
        if (pctPassed) totalPassed++;

        // 4. Domicile / Regional Criteria
        let domicilePassed = true;
        let domicileNotes = 'Open to all Indian Citizens across all States and UTs.';
        if (exam.id === 'kpsc-kas-2026') {
          if (query.domicileState !== 'Karnataka') {
            domicileNotes = 'All-India candidates may apply under General Merit without state reservation quota.';
          } else {
            domicileNotes = 'Karnataka domicile resident eligible for State Reservation Categories & Rural quota.';
          }
        }
        checks.push({
          title: 'Nationality & State Domicile Status',
          required: exam.level === 'State' ? 'Karnataka Domicile for Reservation Quotas' : 'Citizen of India',
          candidateValue: `${query.domicileState} Resident`,
          passed: domicilePassed,
          notes: domicileNotes,
        });
        totalChecks++;
        if (domicilePassed) totalPassed++;

        const isEligible = checks.every((c) => c.passed);
        const eligibilityPercentage = Math.round((totalPassed / totalChecks) * 100);

        return {
          examId: exam.id,
          examTitle: exam.title,
          conductingBody: exam.conductingBody,
          isEligible,
          eligibilityPercentage,
          checks,
          ageRelaxationApplied: relaxationText,
          recommendation: isEligible
            ? 'You meet all preliminary eligibility criteria! Recommended to add to Preparation Roadmap.'
            : 'One or more criteria need review. Check age or minimum qualifying percentage relaxations.',
        };
      });

      // Sort by eligible first, then match percentage
      results.sort((a, b) => {
        if (a.isEligible && !b.isEligible) return -1;
        if (!a.isEligible && b.isEligible) return 1;
        return b.eligibilityPercentage - a.eligibilityPercentage;
      });

      return {
        data: results,
        success: true,
        isSampleData: true,
        total: results.length,
      };
    }
  },
};
