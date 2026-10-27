from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.preparation import QuestionBank, MockTest

class KsetUgcService:
    """
    Dedicated service for collegiate teaching & academic career examinations:
    Karnataka State Eligibility Test (KSET - KEA) & National Eligibility Test (UGC-NET - NTA).
    """

    PAPER_1_UNITS = [
        {
            "unit_number": 1,
            "unit_name": "Teaching Aptitude",
            "topics": [
                "Teaching: Concept, Objectives, Levels of Teaching (Memory, Understanding and Reflective)",
                "Learner Characteristics: Adolescent and adult learners, Individual differences",
                "Factors Affecting Teaching: Teacher, Learner, Support material, Instructional facilities",
                "Methods of Teaching: Teacher-centred vs Learner-centred, Offline vs Online (Swayam, Swayamprabha, MOOCs)",
                "Evaluation Systems: Elements and Types of Evaluation, Evaluation in Choice Based Credit System (CBCS)",
            ],
            "estimated_weightage_questions": 5,
        },
        {
            "unit_number": 2,
            "unit_name": "Research Aptitude",
            "topics": [
                "Research: Meaning, Types, and Characteristics, Positivism and Post-positivistic approach",
                "Methods of Research: Experimental, Descriptive, Historical, Qualitative and Quantitative",
                "Steps of Research, Thesis and Article writing: Format and Styles of referencing",
                "Application of ICT in Research, Research Ethics and Plagiarism guidelines",
            ],
            "estimated_weightage_questions": 5,
        },
        {
            "unit_number": 3,
            "unit_name": "Comprehension",
            "topics": [
                "A passage of text with 5 objective questions to test deduction and conceptual grasping",
            ],
            "estimated_weightage_questions": 5,
        },
        {
            "unit_number": 4,
            "unit_name": "Communication",
            "topics": [
                "Communication: Meaning, types and characteristics of communication",
                "Effective Communication: Verbal and Non-verbal, Inter-cultural and group communications",
                "Barriers to Effective Communication",
                "Mass-Media and Society",
            ],
            "estimated_weightage_questions": 5,
        },
        {
            "unit_number": 5,
            "unit_name": "Mathematical Reasoning and Aptitude",
            "topics": [
                "Types of Reasoning: Number series, Letter series, Codes and Relationships",
                "Mathematical Aptitude: Fraction, Time & Distance, Ratio, Proportion and Percentage",
                "Profit and Loss, Interest and Discounting, Averages",
            ],
            "estimated_weightage_questions": 5,
        },
        {
            "unit_number": 6,
            "unit_name": "Logical Reasoning",
            "topics": [
                "Understanding the structure of arguments: Argument forms, structure of categorical propositions",
                "Evaluating and distinguishing deductive and inductive reasoning",
                "Analogies, Venn diagram: Simple and multiple use for establishing validity of arguments",
                "Indian Logic: Means of knowledge (Pramanas): Pratyaksha, Anumana, Upamana, Shabda, Arthapatti, Anupalabddhi",
                "Structure and kinds of Anumana (inference), Vyapti, Hetvabhasas (fallacies of inference)",
            ],
            "estimated_weightage_questions": 5,
        },
        {
            "unit_number": 7,
            "unit_name": "Data Interpretation",
            "topics": [
                "Sources, acquisition and classification of Data",
                "Quantitative and Qualitative Data",
                "Graphical representation: Bar-chart, Histograms, Pie-chart, Table-chart and Line-chart",
                "Data and Governance",
            ],
            "estimated_weightage_questions": 5,
        },
        {
            "unit_number": 8,
            "unit_name": "Information and Communication Technology (ICT)",
            "topics": [
                "ICT: General abbreviations and terminology",
                "Basics of Internet, Intranet, E-mail, Audio and Video-conferencing",
                "Digital initiatives in higher education (NPTEL, National Digital Library, e-ShodhSindhu)",
                "ICT and Governance",
            ],
            "estimated_weightage_questions": 5,
        },
        {
            "unit_number": 9,
            "unit_name": "People, Development and Environment",
            "topics": [
                "Development and environment: Millennium Development and Sustainable Development Goals (SDGs)",
                "Human and environment interaction: Anthropogenic activities and their impacts on environment",
                "Environmental issues: Air, Water, Soil, Noise, Waste (solid, biomedical, hazardous, e-waste)",
                "Impacts of pollutants on human health, Natural and energy resources: Solar, Wind, Soil, Hydro, Geothermal, Biomass",
                "Natural hazards and disasters: Mitigation strategies, Environmental Protection Act (1986), Paris Agreement, International Solar Alliance",
            ],
            "estimated_weightage_questions": 5,
        },
        {
            "unit_number": 10,
            "unit_name": "Higher Education System",
            "topics": [
                "Institutions of higher learning and education in ancient India (Takshashila, Nalanda, Valabhi)",
                "Evolution of higher learning and research in Post Independence India",
                "Oriental, Conventional and Non-conventional learning programmes in India",
                "Professional, Technical and Skill Based education",
                "Value education and environmental education",
                "Policies, Governance, and Administration: NEP 2020 structures, UGC, AICTE, NAAC accreditations",
            ],
            "estimated_weightage_questions": 5,
        },
    ]

    PAPER_2_SUBJECTS = [
        {"subject_code": "087", "subject_name": "Computer Science and Applications", "total_units": 10},
        {"subject_code": "008", "subject_name": "Commerce", "total_units": 10},
        {"subject_code": "017", "subject_name": "Management", "total_units": 10},
        {"subject_code": "002", "subject_name": "Political Science", "total_units": 10},
        {"subject_code": "001", "subject_name": "Economics / Rural Economics", "total_units": 10},
        {"subject_code": "030", "subject_name": "English Literature", "total_units": 10},
    ]

    def __init__(self, db: Session):
        self.db = db

    def get_curriculum_overview(self) -> Dict[str, Any]:
        """Return the structured syllabus overview and differences between KSET and UGC-NET."""
        return {
            "title": "Teaching and Academic Career Examinations Hub",
            "paper_1": {
                "total_units": 10,
                "total_questions": 50,
                "total_marks": 100,
                "duration_minutes": 60,
                "negative_marking": 0.0,
                "units": self.PAPER_1_UNITS,
            },
            "paper_2": {
                "total_questions": 100,
                "total_marks": 200,
                "duration_minutes": 120,
                "negative_marking": 0.0,
                "available_subjects": self.PAPER_2_SUBJECTS,
            },
            "exam_distinctions": [
                {
                    "aspect": "Conducting Agency",
                    "kset": "Karnataka Examination Authority (KEA)",
                    "ugc_net": "National Testing Agency (NTA)",
                },
                {
                    "aspect": "Territorial Scope",
                    "kset": "Valid for Assistant Professor appointments across Karnataka Universities & Colleges",
                    "ugc_net": "Valid for Assistant Professor appointments pan-India",
                },
                {
                    "aspect": "JRF Award",
                    "kset": "Eligibility for Assistant Professorship ONLY (No JRF)",
                    "ugc_net": "Both JRF (Junior Research Fellowship) and Assistant Professorship",
                },
                {
                    "aspect": "Upper Age Limit",
                    "kset": "No upper age limit for Assistant Professor",
                    "ugc_net": "No upper age limit for Assistant Professor; Maximum 30 years for JRF (relaxations apply)",
                },
                {
                    "aspect": "Qualifying Marks",
                    "kset": "Aggregate 40% across both papers (35% for reserved SC/ST/PwD/Cat-I/OBC)",
                    "ugc_net": "Aggregate 40% across both papers (35% for reserved SC/ST/PwD/OBC-NCL)",
                },
            ],
            "verified_rules_source": "UGC Regulations on Minimum Qualifications (2018) & KEA KSET 2026 Notification",
        }

    def get_pyq_practice_set(
        self,
        exam_code: str = "UGC-NET",
        unit_number: Optional[int] = None,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """Fetch verified PYQ questions matching the requested unit or subject."""
        query = self.db.query(QuestionBank).filter(
            QuestionBank.exam_code.in_(["UGC-NET", "KSET", "UGC-NET-PAPER1", "KSET-PAPER1"]),
            QuestionBank.is_active == True,
        )

        if unit_number is not None and 1 <= unit_number <= 10:
            unit_name = self.PAPER_1_UNITS[unit_number - 1]["unit_name"]
            query = query.filter(QuestionBank.topic.ilike(f"%{unit_name}%"))

        questions = query.limit(limit).all()

        return [
            {
                "id": q.id,
                "exam_code": q.exam_code,
                "paper_type": q.paper_type,
                "subject": q.subject,
                "topic": q.topic,
                "question_text": q.question_text,
                "options": q.options,
                "correct_option_index": q.correct_option_index,
                "explanation": q.explanation,
                "difficulty": q.difficulty,
                "pyq_year": q.pyq_year,
                "source_citation": q.source_citation or f"Official Commission Question Paper ({q.pyq_year or 2024})",
            }
            for q in questions
        ]
