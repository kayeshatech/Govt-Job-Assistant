from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.models.exam import (
    ExamAuthority,
    ExamCategory,
    GovernmentExam,
    ExamStage,
    SyllabusTopic,
    PayScale,
)
from app.models.eligibility import (
    QualificationRule,
    AgeCriteria,
    AgeRelaxationRule,
    CommunityDomicileRule,
)
from app.models.notification import (
    RecruitmentNotification,
    RecruitmentPost,
    NotificationVersion,
    NotificationSource,
)
from app.models.monitoring import OfficialSource
from app.models.rag import DocumentKnowledgeBase, DocumentChunk
from app.models.preparation import QuestionBank, MockTest
from app.models.student import (
    StudentProfile,
    StudentPreference,
    SavedExam,
    StudyPlan,
    DailyStudyTask,
)
from app.models.community import (
    StudyGroup,
    GroupDiscussionMessage,
    MentorProfile,
)

def seed_database(db: Session) -> None:
    """Populates authoritative, normalized Indian Government examination and notification records."""
    
    # 1. Authorities
    authorities = {
        "UPSC": ExamAuthority(
            code="UPSC",
            name="Union Public Service Commission",
            portal_type="Central",
            website_url="https://upsc.gov.in",
            state_jurisdiction="All India",
        ),
        "SSC": ExamAuthority(
            code="SSC",
            name="Staff Selection Commission",
            portal_type="Central",
            website_url="https://ssc.gov.in",
            state_jurisdiction="All India",
        ),
        "ISRO": ExamAuthority(
            code="ISRO-ICRB",
            name="Indian Space Research Organisation (ICRB)",
            portal_type="Central PSU",
            website_url="https://isro.gov.in",
            state_jurisdiction="All India",
        ),
        "NTA_KEA": ExamAuthority(
            code="NTA-KEA",
            name="National Testing Agency & KEA Karnataka",
            portal_type="Central & State",
            website_url="https://ugcnet.nta.ac.in",
            state_jurisdiction="All India / Karnataka",
        ),
        "IBPS": ExamAuthority(
            code="IBPS",
            name="Institute of Banking Personnel Selection",
            portal_type="Central Banking",
            website_url="https://ibps.in",
            state_jurisdiction="All India",
        ),
        "RBI": ExamAuthority(
            code="RBI",
            name="Reserve Bank of India",
            portal_type="Central Regulatory",
            website_url="https://rbi.org.in",
            state_jurisdiction="All India",
        ),
        "RRB": ExamAuthority(
            code="RRB",
            name="Railway Recruitment Control Board",
            portal_type="Central Railways",
            website_url="https://indianrailways.gov.in",
            state_jurisdiction="All India",
        ),
        "KPSC": ExamAuthority(
            code="KPSC",
            name="Karnataka Public Service Commission",
            portal_type="State Administration",
            website_url="https://kpsc.kar.nic.in",
            state_jurisdiction="Karnataka",
        ),
    }

    for auth in authorities.values():
        existing = db.query(ExamAuthority).filter(ExamAuthority.code == auth.code).first()
        if not existing:
            db.add(auth)
    db.commit()

    # Reload authorities with IDs
    auth_records = {}
    for key, a in authorities.items():
        rec = db.query(ExamAuthority).filter(ExamAuthority.code == a.code).first()
        auth_records[key] = rec
        auth_records[a.code] = rec

    # 2. Categories
    categories = {
        "CIVIL": ExamCategory(code="CIVIL", name="Civil Services & Administration", description="IAS, IPS, IFS, State KAS"),
        "SSC": ExamCategory(code="SSC", name="Staff Selection", description="SSC CGL, CHSL, CPO Central Ministries"),
        "ENG_PSU": ExamCategory(code="ENG_PSU", name="Engineering & PSU", description="ISRO, BARC, DRDO, GATE Technical Cadres"),
        "TEACHING": ExamCategory(code="TEACHING", name="Teaching & Lectureship", description="UGC-NET, CSIR, KSET Assistant Professor & JRF"),
        "BANKING": ExamCategory(code="BANKING", name="Banking & Finance", description="IBPS PO, SBI, RBI Grade B"),
        "RAILWAYS": ExamCategory(code="RAILWAYS", name="Railways", description="RRB NTPC, Railway Protection Force, JE"),
        "STATE_ADMIN": ExamCategory(code="STATE_ADMIN", name="State Administration", description="State Public Service Commissions"),
    }

    for cat in categories.values():
        existing = db.query(ExamCategory).filter(ExamCategory.code == cat.code).first()
        if not existing:
            db.add(cat)
    db.commit()

    cat_records = {}
    for key, c in categories.items():
        rec = db.query(ExamCategory).filter(ExamCategory.code == c.code).first()
        cat_records[key] = rec
        cat_records[c.code] = rec

    # 3. Government Examinations
    exams_data = [
        {
            "slug": "upsc-cse-2026",
            "title": "UPSC Civil Services Examination (CSE) 2026",
            "code": "UPSC-CSE",
            "level": "Central",
            "category_code": "CIVIL",
            "authority_code": "UPSC",
            "posts_summary": "IAS, IPS, IFS, IRS, and Group A/B Central Administrative Cadres",
            "vacancies_count": 1105,
            "min_qualification": "Bachelor's Degree in any discipline from a recognized University",
            "eligible_streams": ["Engineering/B.Tech", "Arts & Humanities", "Science/B.Sc", "Commerce/B.Com", "Medical", "Law"],
            "negative_marking": "-0.33 mark deduction per wrong answer (Prelims Paper I & II)",
            "duration_info": "Paper I (GS): 2 Hours | Paper II (CSAT): 2 Hours",
            "relevance_for_tech": "Analytical problem solving awards CSAT Paper II; optional papers include Mathematics, Physics, and Electrical Engineering.",
            "official_website": "https://upsc.gov.in",
            "status": "Upcoming",
            "min_age": 21,
            "max_age_general": 32,
            "cutoff_date": "2026-08-01",
            "pay_level": "Level 10",
            "basic_min": 56100,
            "basic_max": 177500,
            "gross_metro": "₹98,500/month",
            "qual_level": "Bachelor's Degree",
            "min_pct": 0.0,
            "allowed_streams": ["Any"],
            "stages": [
                {"name": "Preliminary Examination", "order": 1, "type": "Objective MCQ", "details": "Paper I (GS - 200 Marks) & Paper II (CSAT Qualifying 33% - 200 Marks)", "marks": 400},
                {"name": "Main Written Examination", "order": 2, "type": "Written Descriptive", "details": "9 Descriptive Papers (1750 Total Marks)", "marks": 1750},
                {"name": "Personality Test (Interview)", "order": 3, "type": "Interview", "details": "Board assessment of administrative and public service aptitude", "marks": 275},
            ],
            "syllabus_topics": [
                ("General Studies", "Indian Polity & Governance", "Constitution, Panchayati Raj, Public Policy, Rights Issues"),
                ("General Studies", "Indian & World Geography", "Physical, Social, Economic Geography of India and the World"),
                ("General Studies", "History & Indian National Movement", "Ancient, Medieval, Modern India & Freedom Struggle"),
                ("CSAT", "Comprehension & Interpersonal Skills", "Critical inference, Logical reasoning and analytical ability"),
                ("CSAT", "Basic Numeracy & Data Interpretation", "Numbers, relations, orders of magnitude, charts, graphs Class X level"),
            ],
        },
        {
            "slug": "ssc-cgl-2026",
            "title": "SSC Combined Graduate Level (CGL) 2026",
            "code": "SSC-CGL",
            "level": "Central",
            "category_code": "SSC",
            "authority_code": "SSC",
            "posts_summary": "Assistant Section Officer (CSS, MEA, IB), Inspector (GST, IT, Examiner), Sub-Inspector (CBI)",
            "vacancies_count": 14750,
            "min_qualification": "Bachelor's Degree in any discipline from a recognized University",
            "eligible_streams": ["Engineering/B.Tech", "Commerce/B.Com", "Science/B.Sc", "Arts & Humanities"],
            "negative_marking": "-0.50 (Tier-I) / -1.00 (Tier-II Sectional)",
            "duration_info": "Tier-I: 60 Minutes (100 Qs) | Tier-II: 2 Hours 15 Minutes",
            "relevance_for_tech": "Tier-II Computer Knowledge Module and Quantitative Aptitude award analytical backgrounds.",
            "official_website": "https://ssc.gov.in",
            "status": "Upcoming",
            "min_age": 18,
            "max_age_general": 30,
            "cutoff_date": "2026-08-01",
            "pay_level": "Level 7",
            "basic_min": 44900,
            "basic_max": 142400,
            "gross_metro": "₹75,200/month",
            "qual_level": "Bachelor's Degree",
            "min_pct": 0.0,
            "allowed_streams": ["Any"],
            "stages": [
                {"name": "Tier I (CBE)", "order": 1, "type": "Objective MCQ", "details": "General Intelligence, General Awareness, Quantitative Aptitude, English (200 Marks)", "marks": 200},
                {"name": "Tier II (CBE)", "order": 2, "type": "Objective & Computer", "details": "Math, Reasoning, English, General Awareness, Computer Module & DEST", "marks": 390},
            ],
            "syllabus_topics": [
                ("Quantitative Aptitude", "Arithmetic & Advanced Mathematics", "Algebra, Trigonometry, Geometry, Mensuration, Number Systems"),
                ("Reasoning", "General Intelligence", "Analogies, Venn diagrams, Coding-Decoding, Non-verbal reasoning"),
                ("General Awareness", "Indian Polity & Economy", "Current affairs, scientific research, basic economic principles"),
                ("Computer Knowledge", "Computer Fundamentals", "Hardware, Software, Internet protocols, Cybersecurity basics"),
            ],
        },
        {
            "slug": "isro-scientist-sc-2026",
            "title": "ISRO Centralised Recruitment (ICRB) Scientist / Engineer \"SC\" 2026",
            "code": "ISRO-ICRB",
            "level": "Central",
            "category_code": "ENG_PSU",
            "authority_code": "ISRO",
            "posts_summary": "Scientist / Engineer 'SC' (Computer Science, Electronics, Mechanical)",
            "vacancies_count": 326,
            "min_qualification": "BE / B.Tech or equivalent in first class with minimum aggregate 65% or CGPA 6.84/10",
            "eligible_streams": ["Engineering/B.Tech (CSE, ECE, ME)"],
            "negative_marking": "-0.33 mark deduction per incorrect answer",
            "duration_info": "120 Minutes (80 Discipline Specific Questions)",
            "relevance_for_tech": "100% Core Technical discipline; tests Computer Science algorithms, operating systems, networks and databases.",
            "official_website": "https://isro.gov.in",
            "status": "Upcoming",
            "min_age": 21,
            "max_age_general": 28,
            "cutoff_date": "2026-04-10",
            "pay_level": "Level 10",
            "basic_min": 56100,
            "basic_max": 177500,
            "gross_metro": "₹96,000/month",
            "qual_level": "Bachelor of Engineering / B.Tech",
            "min_pct": 65.0,
            "allowed_streams": ["Computer Science", "Information Technology", "Electronics", "Mechanical"],
            "stages": [
                {"name": "Written Examination", "order": 1, "type": "Objective MCQ", "details": "80 Core discipline engineering questions + Aptitude Part B", "marks": 100},
                {"name": "Interview Screening", "order": 2, "type": "Interview", "details": "Technical panel evaluation at ISRO HQ or Satellite Centre", "marks": 100},
            ],
            "syllabus_topics": [
                ("Computer Science", "Data Structures & Algorithms", "Graph algorithms, Dynamic Programming, Complexity analysis"),
                ("Computer Science", "Operating Systems & Concurrency", "Process synchronization, Virtual memory, Scheduling"),
                ("Computer Science", "Computer Networks", "TCP/IP, Routing algorithms, Network security protocols"),
                ("Computer Science", "Database Systems", "SQL, Normalization, ACID transactions, Indexing structures"),
            ],
        },
        {
            "slug": "kset-ugc-net-2026",
            "title": "KSET / UGC-NET National Eligibility Test (Lectureship & JRF) 2026",
            "code": "UGC-NET / KSET",
            "level": "Central",
            "category_code": "TEACHING",
            "authority_code": "NTA_KEA",
            "posts_summary": "Assistant Professor & Junior Research Fellowship (JRF)",
            "vacancies_count": 4800,
            "min_qualification": "Master's Degree (M.Tech, M.Sc, M.A, MCA) with minimum 55% marks (50% for reserved categories)",
            "eligible_streams": ["Master of Science (M.Sc)", "Master of Technology (M.Tech)", "Master of Arts (M.A)", "Ph.D / Research Scholar"],
            "negative_marking": "No negative marking",
            "duration_info": "Single 3-Hour Session (Paper 1: 50 Qs + Paper 2: 100 Qs)",
            "relevance_for_tech": "Subject Code 87 (Computer Science & Applications) grants university faculty eligibility.",
            "official_website": "https://ugcnet.nta.ac.in",
            "status": "Upcoming",
            "min_age": 21,
            "max_age_general": 30,  # 30 for JRF, No limit for Assistant Prof
            "cutoff_date": "2026-06-01",
            "pay_level": "Academic Level 10",
            "basic_min": 57700,
            "basic_max": 182400,
            "gross_metro": "₹89,200/month",
            "qual_level": "Master's Degree",
            "min_pct": 55.0,
            "allowed_streams": ["Any Master Discipline"],
            "stages": [
                {"name": "Computer Based Test (CBT)", "order": 1, "type": "Objective MCQ", "details": "Paper 1 (General Teaching & Research - 100 Marks) + Paper 2 (Discipline - 200 Marks)", "marks": 300},
            ],
            "syllabus_topics": [
                ("General Aptitude", "Teaching Aptitude", "Methods of teaching, evaluation systems, learner characteristics"),
                ("General Aptitude", "Research Aptitude", "Methodology, ethics, thesis writing, qualitative & quantitative analysis"),
                ("General Aptitude", "ICT & Higher Education", "Digital education initiatives, governance, policy frameworks"),
                ("Computer Science", "Discrete Math & Theory of Computation", "Automata, logic, graph theory, grammar models"),
            ],
        },
        {
            "slug": "kpsc-kas-2026",
            "title": "Karnataka State Gazetted Probationers Examination (KPSC KAS) 2026",
            "code": "KPSC-KAS",
            "level": "State",
            "category_code": "STATE_ADMIN",
            "authority_code": "KPSC",
            "posts_summary": "Assistant Commissioner (Group A), Tahsildar (Group B), Commercial Tax Officer",
            "vacancies_count": 384,
            "min_qualification": "Bachelor's Degree in any discipline from a recognized University",
            "eligible_streams": ["Engineering/B.Tech", "Commerce/B.Com", "Science/B.Sc", "Arts & Humanities"],
            "negative_marking": "-0.25 mark per wrong answer (Prelims Paper 1 & 2)",
            "duration_info": "Paper 1: 2 Hours (100 Qs) | Paper 2: 2 Hours (100 Qs)",
            "relevance_for_tech": "Karnataka domicile candidates obtain state reservation quotas; tech graduates benefit in Mental Ability & Science Paper 2.",
            "official_website": "https://kpsc.kar.nic.in",
            "status": "Active",
            "min_age": 21,
            "max_age_general": 35,
            "cutoff_date": "2026-03-01",
            "pay_level": "State Level 10",
            "basic_min": 56550,
            "basic_max": 96400,
            "gross_metro": "₹84,200/month",
            "qual_level": "Bachelor's Degree",
            "min_pct": 0.0,
            "allowed_streams": ["Any"],
            "stages": [
                {"name": "Preliminary Examination", "order": 1, "type": "Objective MCQ", "details": "Paper 1 (GS & Humanities - 200 Marks) & Paper 2 (Science, Tech & Mental Ability - 200 Marks)", "marks": 400},
                {"name": "Main Written Examination", "order": 2, "type": "Written Descriptive", "details": "7 Descriptive Papers including Kannada & English qualifying papers", "marks": 1750},
                {"name": "Personality Interview", "order": 3, "type": "Interview", "details": "State administration interview", "marks": 200},
            ],
            "syllabus_topics": [
                ("General Studies", "Karnataka History & Regional Heritage", "Dynasties, literature, art, social reform movements in Karnataka"),
                ("General Studies", "Karnataka Geography & Environment", "Western Ghats, river systems, climate patterns, rural governance"),
                ("Mental Ability", "Analytical Aptitude & Logical Reasoning", "Number series, data sufficiency, mathematical puzzles"),
            ],
        },
        {
            "slug": "ibps-po-2026",
            "title": "IBPS Probationary Officer / Management Trainee (CWE PO/MT-XVI) 2026",
            "code": "IBPS-PO",
            "level": "Central",
            "category_code": "BANKING",
            "authority_code": "IBPS",
            "posts_summary": "Probationary Officer in 11 Participating Public Sector Banks",
            "vacancies_count": 6540,
            "min_qualification": "Bachelor's Degree in any discipline from a recognized University",
            "eligible_streams": ["Engineering/B.Tech", "Commerce/B.Com", "Science/B.Sc", "Arts & Humanities"],
            "negative_marking": "-0.25 mark per wrong answer",
            "duration_info": "Prelims: 60 Minutes (100 Qs) | Mains: 3 Hours 30 Minutes",
            "relevance_for_tech": "Fast 6-month recruitment cycle; analytical skill sets excel in sectional reasoning & DI.",
            "official_website": "https://ibps.in",
            "status": "Upcoming",
            "min_age": 20,
            "max_age_general": 30,
            "cutoff_date": "2026-08-01",
            "pay_level": "Scale I Officer",
            "basic_min": 36000,
            "basic_max": 63840,
            "gross_metro": "₹68,500/month",
            "qual_level": "Bachelor's Degree",
            "min_pct": 0.0,
            "allowed_streams": ["Any"],
            "stages": [
                {"name": "Preliminary Examination", "order": 1, "type": "Objective MCQ", "details": "English (30 Qs), Quantitative (35 Qs), Reasoning (35 Qs) with 20-min timing", "marks": 100},
                {"name": "Main Examination", "order": 2, "type": "Objective & Descriptive", "details": "Objective (200 Marks) + English Essay & Letter Writing (25 Marks)", "marks": 225},
                {"name": "Common Interview", "order": 3, "type": "Interview", "details": "Conducted jointly by Participating Banks", "marks": 100},
            ],
            "syllabus_topics": [
                ("Quantitative Aptitude", "Data Analysis & Interpretation", "Bar charts, pie charts, radar graphs, tabular data sets"),
                ("Reasoning", "Puzzles & Seating Arrangements", "Linear, circular, multi-variable arrangement puzzles"),
                ("Banking Awareness", "Financial Systems & RBI Regulations", "Monetary policy, NPA management, digital banking initiatives"),
            ],
        },
    ]

    for item in exams_data:
        existing = db.query(GovernmentExam).filter(GovernmentExam.slug == item["slug"]).first()
        if existing:
            continue

        auth = auth_records[item["authority_code"]]
        cat = cat_records[item["category_code"]]

        exam = GovernmentExam(
            slug=item["slug"],
            title=item["title"],
            code=item["code"],
            level=item["level"],
            posts_summary=item["posts_summary"],
            vacancies_count=item["vacancies_count"],
            min_qualification_summary=item["min_qualification"],
            eligible_streams=item["eligible_streams"],
            attempts_info={"General": 6, "OBC": 9, "SC/ST": "Unlimited", "PwD": 9},
            negative_marking=item["negative_marking"],
            duration_info=item["duration_info"],
            relevance_for_tech=item["relevance_for_tech"],
            official_website=item["official_website"],
            status=item["status"],
            authority_id=auth.id,
            category_id=cat.id,
        )
        db.add(exam)
        db.flush()

        # Qualification Rule
        qual = QualificationRule(
            exam_id=exam.id,
            min_degree_level=item["qual_level"],
            allowed_streams=item["allowed_streams"],
            min_aggregate_percentage=item["min_pct"],
            final_year_eligible=True,
            official_clause_reference="Gazette Notification Rule 3 (Qualifications)",
        )
        db.add(qual)

        # Age Criteria & Relaxations
        age_c = AgeCriteria(
            exam_id=exam.id,
            min_age=item["min_age"],
            max_age_general=item["max_age_general"],
            cutoff_reference_date=item["cutoff_date"],
            official_clause="Statutory Age Notice Para 4",
        )
        db.add(age_c)
        db.flush()

        # Add explicit non-arbitrary statutory relaxations
        db.add(AgeRelaxationRule(age_criteria_id=age_c.id, community_category="OBC-NCL", relaxation_years=3, max_age_relaxed=item["max_age_general"] + 3, applicable_conditions="Non-creamy layer certificate required"))
        db.add(AgeRelaxationRule(age_criteria_id=age_c.id, community_category="SC", relaxation_years=5, max_age_relaxed=item["max_age_general"] + 5, applicable_conditions="Valid caste certificate required"))
        db.add(AgeRelaxationRule(age_criteria_id=age_c.id, community_category="ST", relaxation_years=5, max_age_relaxed=item["max_age_general"] + 5, applicable_conditions="Valid tribe certificate required"))
        db.add(AgeRelaxationRule(age_criteria_id=age_c.id, community_category="PwD", relaxation_years=10, max_age_relaxed=item["max_age_general"] + 10, applicable_conditions="Minimum 40% benchmark disability certificate required"))

        # Domicile Rule
        if item["level"] == "State":
            db.add(CommunityDomicileRule(
                exam_id=exam.id,
                target_state="Karnataka",
                requires_domicile=False,  # allows all-India under General, but reserves quotas
                allows_all_india_candidates=True,
                reservation_quota_rules="Karnataka residents eligible for 2A/2B/3A/3B and Rural quotas.",
            ))
        else:
            db.add(CommunityDomicileRule(
                exam_id=exam.id,
                target_state=None,
                requires_domicile=False,
                allows_all_india_candidates=True,
                reservation_quota_rules="Citizen of India as per Constitution Articles 5-11.",
            ))

        # Pay Scale
        db.add(PayScale(
            exam_id=exam.id,
            post_name=item["posts_summary"].split(",")[0],
            pay_level=item["pay_level"],
            basic_pay_min=item["basic_min"],
            basic_pay_max=item["basic_max"],
            gross_approx_metro=item["gross_metro"],
            source_clause="7th Central Pay Commission Gazette notification",
            official_source_url=item["official_website"],
            effective_date="2026-01-01",
        ))

        # Stages & Syllabus
        for stage_data in item["stages"]:
            stage = ExamStage(
                exam_id=exam.id,
                stage_order=stage_data["order"],
                name=stage_data["name"],
                stage_type=stage_data["type"],
                details=stage_data["details"],
                total_marks=stage_data["marks"],
            )
            db.add(stage)
            db.flush()

            # Map syllabus topics
            for sub, top, det in item["syllabus_topics"]:
                db.add(SyllabusTopic(
                    stage_id=stage.id,
                    exam_id=exam.id,
                    subject_area=sub,
                    topic_name=top,
                    topic_details=det,
                    is_core_overlap=("Polity" in top or "Quantitative" in top or "Reasoning" in top or "Data" in top),
                    overlap_keywords=[sub.lower(), top.lower()],
                ))

    db.commit()

    # 4. Recruitment Notifications (with source, verification status & versions)
    notifs_data = [
        {
            "advt": "05/2026-CSP",
            "title": "UPSC Civil Services (Preliminary) Examination 2026 — Official Gazetted Notification",
            "agency": "Union Public Service Commission (UPSC)",
            "category": "Civil Services",
            "release": "2026-02-14",
            "deadline": "2026-03-05",
            "exam_date": "2026-05-24",
            "vacancies": 1105,
            "pdf_url": "https://upsc.gov.in/sites/default/files/Notice-CSP-2026-Engl.pdf",
            "portal": "https://upsconline.nic.in",
            "status": "Active",
            "highlights": [
                "1,105 Vacancies across IAS, IPS, IFS, IRS, and Group A/B Services",
                "Preliminary Examination date confirmed: 24th May 2026 (Sunday)",
                "OTR (One Time Registration) mandatory before applying",
            ],
            "snippet": "Graduate in any discipline. Age 21 to 32 years as on 1st August 2026 with statutory relaxations.",
            "fee": "₹100 (Exempted for Female, SC, ST & PwD candidates)",
            "portal_name": "UPSC Official Portal (upsc.gov.in)",
            "tags": ["UPSC", "IAS/IPS", "Graduate", "Central Gov", "Level 10"],
        },
        {
            "advt": "F.No. 3/1/2026-P&P-I",
            "title": "SSC CGL 2026 — Revised Vacancy & Examination Schedule Corrigendum Notice",
            "agency": "Staff Selection Commission (SSC)",
            "category": "Staff Selection",
            "release": "2026-02-18",
            "deadline": "2026-03-25",
            "exam_date": "2026-09-12",
            "vacancies": 14750,
            "pdf_url": "https://ssc.gov.in/api/corrigendum-cgl-2026.pdf",
            "portal": "https://ssc.gov.in",
            "status": "Corrigendum",
            "highlights": [
                "Vacancies incremented by 1,250 posts in Central Board of Direct Taxes (CBDT)",
                "Tier-I Computer Based Test dates rescheduled to September 2026",
            ],
            "snippet": "Bachelor's Degree in any discipline. Age 18-30 years depending on post code.",
            "fee": "₹100 (Women, SC, ST, ESM exempted)",
            "portal_name": "SSC Portal (ssc.gov.in)",
            "tags": ["SSC CGL", "CBDT", "Corrigendum", "Vacancies Increased"],
        },
        {
            "advt": "KEA/ED/KSET-2026/01",
            "title": "Karnataka State Eligibility Test (KSET-2026) for Assistant Professorship Notification",
            "agency": "Karnataka Examination Authority (KEA)",
            "category": "Teaching & Lectureship",
            "release": "2026-02-02",
            "deadline": "2026-03-12",
            "exam_date": "2026-06-28",
            "vacancies": 4200,
            "pdf_url": "https://cetonline.karnataka.gov.in/kea/kset2026",
            "portal": "https://cetonline.karnataka.gov.in",
            "status": "Active",
            "highlights": [
                "Assistant Professor eligibility across Karnataka Universities",
                "41 Subject disciplines including Computer Science and Electronics",
                "No upper age ceiling for Assistant Professor eligibility test",
            ],
            "snippet": "Master's degree with minimum 55% marks (50% for reserved categories).",
            "fee": "General: ₹1000 | Reserved: ₹500",
            "portal_name": "KEA Portal (cetonline.karnataka.gov.in)",
            "tags": ["KSET", "Lectureship", "KEA", "Karnataka", "Master Degree"],
        },
    ]

    for nd in notifs_data:
        existing = db.query(RecruitmentNotification).filter(RecruitmentNotification.advertisement_number == nd["advt"]).first()
        if existing:
            continue

        notif = RecruitmentNotification(
            advertisement_number=nd["advt"],
            title=nd["title"],
            agency_name=nd["agency"],
            category_name=nd["category"],
            release_date=nd["release"],
            application_deadline=nd["deadline"],
            tentative_exam_date=nd["exam_date"],
            total_vacancies=nd["vacancies"],
            official_pdf_url=nd["pdf_url"],
            official_portal=nd["portal"],
            status=nd["status"],
            highlights=nd["highlights"],
            eligibility_snippet=nd["snippet"],
            fee_structure=nd["fee"],
            is_verified_official=True,
            verification_status="Verified",
            verified_by="Govexa Senior Gazette Officer",
            source_portal_name=nd["portal_name"],
            tags=nd["tags"],
        )
        db.add(notif)
        db.flush()

        # Add initial version entry
        db.add(NotificationVersion(
            notification_id=notif.id,
            version_number=1,
            change_summary="Original Gazetted Release published by Commission",
            effective_date=nd["release"],
        ))

    db.commit()

    # 5. Seed Demo Student Profile & Saved Exam
    demo_student_id = "aspirant-2026-demo"
    existing_student = db.query(StudentProfile).filter(StudentProfile.id == demo_student_id).first()
    if not existing_student:
        student = StudentProfile(
            id=demo_student_id,
            email="priya.sharma@aspirant.in",
            full_name="Priya Sharma",
            date_of_birth="2001-08-15",
            age=24,
            gender="Female",
            category="General / UR",
            domicile_state="Karnataka",
            is_pwd=False,
            education_level="Bachelor of Engineering / B.Tech",
            major_stream="Computer Science & Engineering",
            graduation_year=2024,
            graduation_percentage=74.5,
            preferred_daily_study_hours=6,
            is_onboarded=True,
            role="student",
        )
        db.add(student)
        db.flush()

        # Preferences
        db.add(StudentPreference(
            student_id=student.id,
            target_categories=["Civil Services & Administration", "Teaching & Lectureship"],
            target_exam_codes=["UPSC-CSE", "ISRO-ICRB", "UGC-NET / KSET"],
        ))

        # Saved Exam
        upsc_exam = db.query(GovernmentExam).filter(GovernmentExam.code == "UPSC-CSE").first()
        if upsc_exam:
            db.add(SavedExam(
                student_id=student.id,
                exam_id=upsc_exam.id,
                exam_title=upsc_exam.title,
                conducting_body="Union Public Service Commission",
                status="Applied & Fee Paid",
                registration_number="UPSC-2026-894102",
                notes="Prelims exam center allotted at Bengaluru North Center 04.",
                application_date="2026-02-16",
                exam_date="2026-05-24",
            ))

        # 7. Seed Official Sources in Administrative Registry
        official_sources_data = [
            {
                "authority_code": "UPSC",
                "authority_name": "Union Public Service Commission",
                "official_domain": "upsc.gov.in",
                "listing_url": "https://upsc.gov.in/examinations/active-examinations",
                "source_type": "recruitment_listing",
                "polling_frequency_minutes": 60,
                "fetch_method": "GET_HTML",
                "terms_url": "https://upsc.gov.in/terms-and-conditions",
                "rate_limit_delay_seconds": 2.0,
            },
            {
                "authority_code": "SSC",
                "authority_name": "Staff Selection Commission",
                "official_domain": "ssc.gov.in",
                "listing_url": "https://ssc.gov.in/notice-board",
                "source_type": "notice_board",
                "polling_frequency_minutes": 120,
                "fetch_method": "GET_HTML",
                "terms_url": "https://ssc.gov.in/terms",
                "rate_limit_delay_seconds": 2.0,
            },
            {
                "authority_code": "ISRO-ICRB",
                "authority_name": "Indian Space Research Organisation (ICRB)",
                "official_domain": "isro.gov.in",
                "listing_url": "https://www.isro.gov.in/Careers.html",
                "source_type": "recruitment_listing",
                "polling_frequency_minutes": 180,
                "fetch_method": "GET_HTML",
                "terms_url": "https://www.isro.gov.in/terms.html",
                "rate_limit_delay_seconds": 3.0,
            },
            {
                "authority_code": "KPSC",
                "authority_name": "Karnataka Public Service Commission",
                "official_domain": "kpsc.kar.nic.in",
                "listing_url": "https://kpsc.kar.nic.in/notifications.html",
                "source_type": "notice_board",
                "polling_frequency_minutes": 240,
                "fetch_method": "GET_HTML",
                "terms_url": "https://kpsc.kar.nic.in",
                "rate_limit_delay_seconds": 2.5,
            },
        ]

        for s_data in official_sources_data:
            existing_src = db.query(OfficialSource).filter(
                OfficialSource.authority_code == s_data["authority_code"]
            ).first()
            if not existing_src:
                db.add(OfficialSource(**s_data))

        # 9. Part 4: RAG Knowledge Base & Official Document Chunks
        rag_doc_data = [
            {
                "id": "rag-doc-upsc-cse-2026",
                "title": "UPSC Civil Services Examination 2026 Official Gazette Rules",
                "doc_type": "OFFICIAL_NOTIFICATION",
                "authority_code": "UPSC",
                "exam_code": "UPSC-CSE",
                "version_label": "2026.1",
                "content_hash": "b8a924f74d023b1820984cfb92d6e3827189a0cb98f420489912c018247df901",
                "source_reference": "Gazette of India Extraordinary Part I Section 1 (05/2026-CSP)",
                "total_pages": 4,
                "chunks": [
                    {
                        "index": 0,
                        "page": 1,
                        "heading": "Rule 3: Age Limits & Cut-off Dates",
                        "content": "A candidate must have attained the age of 21 years and must not have attained the age of 32 years on the 1st of August, 2026. The upper age limit will be relaxable up to a maximum of 3 years in the case of candidates belonging to Other Backward Classes (OBC-NCL), up to 5 years for Scheduled Castes (SC) and Scheduled Tribes (ST), and up to 10 years for Persons with Benchmark Disabilities (PwBD).",
                    },
                    {
                        "index": 1,
                        "page": 2,
                        "heading": "Rule 4: Minimum Educational Qualifications",
                        "content": "The candidate must hold a Bachelor's degree of any of Universities incorporated by an Act of the Central or State Legislature in India or other educational institutions established by an Act of Parliament. Candidates appearing at their degree examination are also eligible to apply for the Preliminary Examination.",
                    },
                    {
                        "index": 2,
                        "page": 3,
                        "heading": "Rule 6: Scheme of Examination & Negative Marking",
                        "content": "The Civil Services Examination comprises two successive stages: (i) Civil Services (Preliminary) Examination (Objective type) for the selection of candidates for Main Examination; and (ii) Civil Services (Main) Examination (Written and Interview). For wrong answers in Objective GS Paper 1, one-third (0.66 marks) of the marks assigned to that question will be deducted as negative marking.",
                    },
                ],
            },
            {
                "id": "rag-doc-kset-ugc-2026",
                "title": "KSET / UGC-NET Paper 1 General Aptitude Curriculum & Regulations",
                "doc_type": "OFFICIAL_SYLLABUS",
                "authority_code": "KEA",
                "exam_code": "UGC-NET",
                "version_label": "2026.1",
                "content_hash": "c9284fa920381029384759283749203847592837495029384759283749502938",
                "source_reference": "UGC Regulations on Minimum Qualifications for Appointment of Teachers (2018)",
                "total_pages": 3,
                "chunks": [
                    {
                        "index": 0,
                        "page": 1,
                        "heading": "Unit 1: Teaching Aptitude & CBCS Norms",
                        "content": "Teaching aptitude evaluates understanding of teaching concepts, objectives, memory, understanding and reflective levels of instruction. The Choice Based Credit System (CBCS) in higher education emphasizes student-centric multidisciplinary credit mobility and continuous diagnostic assessment.",
                    },
                    {
                        "index": 1,
                        "page": 2,
                        "heading": "Unit 2: Research Ethics & Thesis Methodology",
                        "content": "Research aptitude encompasses experimental, descriptive, historical, qualitative and quantitative research designs. Research ethics prohibits plagiarism, fabrication, and falsification. Standard academic referencing styles include APA, MLA, and Chicago citation manuals.",
                    },
                    {
                        "index": 2,
                        "page": 3,
                        "heading": "Unit 6 & 8: Indian Logic (Pramanas) and Digital Higher Education",
                        "content": "Indian Logic (Nyaya philosophy) identifies 6 valid Pramanas (means of knowledge): Pratyaksha (perception), Anumana (inference), Upamana (comparison), Shabda (verbal testimony), Arthapatti (postulation), and Anupalabddhi (non-perception). Digital public educational infrastructure includes Swayam, Swayam Prabha, and the National Digital Library.",
                    },
                ],
            },
        ]

        for doc_item in rag_doc_data:
            existing_doc = db.query(DocumentKnowledgeBase).filter(
                DocumentKnowledgeBase.id == doc_item["id"]
            ).first()
            if not existing_doc:
                new_doc = DocumentKnowledgeBase(
                    id=doc_item["id"],
                    title=doc_item["title"],
                    doc_type=doc_item["doc_type"],
                    authority_code=doc_item["authority_code"],
                    exam_code=doc_item["exam_code"],
                    version_label=doc_item["version_label"],
                    content_hash=doc_item["content_hash"],
                    source_reference=doc_item["source_reference"],
                    total_pages=doc_item["total_pages"],
                    is_verified_source=True,
                )
                db.add(new_doc)
                db.flush()

                for c in doc_item["chunks"]:
                    db.add(
                        DocumentChunk(
                            document_id=new_doc.id,
                            chunk_index=c["index"],
                            content=c["content"],
                            page_number=c["page"],
                            section_heading=c["heading"],
                            token_count=len(c["content"].split()),
                        )
                    )

        # 10. Part 4: Verified Question Bank (UPSC, UGC-NET/KSET, SSC)
        qb_data = [
            {
                "id": "qb-ugc-01",
                "exam_code": "UGC-NET",
                "paper_type": "PAPER_1",
                "subject": "General Aptitude",
                "topic": "Teaching Aptitude",
                "question_text": "Which level of teaching involves highest cognitive interaction, critical problem-solving, and independent insight development?",
                "options": [
                    "Memory Level (Herbartian)",
                    "Understanding Level (Morrison)",
                    "Reflective Level (Hunt)",
                    "Autonomous Development Level",
                ],
                "correct_option_index": 2,
                "explanation": "Reflective level of teaching (developed by Hunt) represents the highest cognitive level where learners identify and formulate problems, generate hypotheses, and critically analyze solutions.",
                "difficulty": "MEDIUM",
                "question_source": "OFFICIAL_PYQ",
                "pyq_year": 2024,
                "source_citation": "UGC-NET June 2024 Shift 1 Question Paper",
            },
            {
                "id": "qb-ugc-02",
                "exam_code": "UGC-NET",
                "paper_type": "PAPER_1",
                "subject": "General Aptitude",
                "topic": "Research Aptitude",
                "question_text": "In scientific research, which approach holds that genuine knowledge is exclusively derived through sensory experience and positive verification?",
                "options": [
                    "Positivism",
                    "Post-Positivism",
                    "Phenomenology",
                    "Critical Hermeneutics",
                ],
                "correct_option_index": 0,
                "explanation": "Positivism asserts that authentic knowledge is verifiable through direct sensory observation and quantitative empirical proofs.",
                "difficulty": "MEDIUM",
                "question_source": "OFFICIAL_PYQ",
                "pyq_year": 2023,
                "source_citation": "UGC-NET December 2023 Paper 1",
            },
            {
                "id": "qb-ugc-03",
                "exam_code": "KSET",
                "paper_type": "PAPER_1",
                "subject": "General Aptitude",
                "topic": "Logical Reasoning",
                "question_text": "In classical Indian Logic (Nyaya), which valid means of knowledge (Pramana) denotes cognition through similarity and comparative observation?",
                "options": [
                    "Pratyaksha (Perception)",
                    "Anumana (Inference)",
                    "Upamana (Comparison)",
                    "Arthapatti (Postulation)",
                ],
                "correct_option_index": 2,
                "explanation": "Upamana is knowledge derived from the relation between a word and its denotation based on similarity (e.g. recognizing a wild cow after being told it resembles a domestic cow).",
                "difficulty": "HARD",
                "question_source": "OFFICIAL_PYQ",
                "pyq_year": 2023,
                "source_citation": "KSET 2023 Official Paper 1",
            },
            {
                "id": "qb-upsc-01",
                "exam_code": "UPSC-CSE",
                "paper_type": "PRELIMS_GS",
                "subject": "Indian Polity & Governance",
                "topic": "Constitutional Framework",
                "question_text": "Under Article 324 of the Constitution of India, the superintendence, direction, and control of elections to which of the following is vested in the Election Commission?",
                "options": [
                    "Parliament, State Legislatures, and the offices of President & Vice-President",
                    "Panchayats and Municipalities exclusively",
                    "State Legislative Councils only",
                    "District Planning Committees",
                ],
                "correct_option_index": 0,
                "explanation": "Article 324 vests the superintendence of elections to Parliament, State Legislatures, and the President/Vice-President in the ECI. Panchayats/Municipalities are conducted by State Election Commissions under Article 243K.",
                "difficulty": "MEDIUM",
                "question_source": "OFFICIAL_PYQ",
                "pyq_year": 2023,
                "source_citation": "UPSC Civil Services (Preliminary) Examination 2023 GS Paper 1",
            },
            {
                "id": "qb-ssc-01",
                "exam_code": "SSC-CGL",
                "paper_type": "TIER_1",
                "subject": "Quantitative Aptitude",
                "topic": "Percentages & Ratio",
                "question_text": "If the price of sugar increases by 25%, by what percentage must a household reduce its consumption so that the total expenditure remains unchanged?",
                "options": [
                    "15%",
                    "20%",
                    "25%",
                    "30%",
                ],
                "correct_option_index": 1,
                "explanation": "Required reduction = [R / (100 + R)] * 100 = [25 / 125] * 100 = 20%.",
                "difficulty": "EASY",
                "question_source": "OFFICIAL_PYQ",
                "pyq_year": 2023,
                "source_citation": "SSC CGL 2023 Tier-I Official Question Paper",
            },
        ]

        for qb_item in qb_data:
            existing_qb = db.query(QuestionBank).filter(QuestionBank.id == qb_item["id"]).first()
            if not existing_qb:
                db.add(QuestionBank(**qb_item))

        # 11. Part 4: Standardized Mock Tests
        mock_data = [
            {
                "id": "mock-kset-paper1-full",
                "title": "KSET / UGC-NET Paper 1 Standardized Full-Length Simulation 2026",
                "exam_code": "UGC-NET",
                "test_type": "FULL_LENGTH",
                "total_questions": 3,
                "duration_minutes": 60,
                "positive_marks_per_q": 2.0,
                "negative_marks_per_q": 0.0,
                "question_ids": ["qb-ugc-01", "qb-ugc-02", "qb-ugc-03"],
                "instructions": "All questions carry 2 marks. There is NO negative marking for incorrect responses.",
                "is_published": True,
            },
            {
                "id": "mock-upsc-prelims-gs",
                "title": "UPSC CSE Prelims General Studies Diagnostic Mini Test",
                "exam_code": "UPSC-CSE",
                "test_type": "TOPIC_WISE",
                "total_questions": 1,
                "duration_minutes": 15,
                "positive_marks_per_q": 2.0,
                "negative_marks_per_q": 0.66,
                "question_ids": ["qb-upsc-01"],
                "instructions": "Standard UPSC pattern. Each question carries 2 marks with 0.66 negative marking.",
                "is_published": True,
            },
        ]

        for m_item in mock_data:
            existing_mock = db.query(MockTest).filter(MockTest.id == m_item["id"]).first()
            if not existing_mock:
                db.add(MockTest(**m_item))

        # 12. Part 5: Verified Mentors (Feature 89)
        mentor_data = [
            {
                "id": "mentor-prof-deshmukh",
                "user_id": "user-mentor-anand-01",
                "full_name": "Prof. Anand Deshmukh",
                "designation": "Former KPSC Member & UPSC Evaluator",
                "specialization": "Public Administration & Indian Polity",
                "institution": "National Institute of Public Policy, Bengaluru",
                "is_verified": True,
                "total_answers_resolved": 142,
                "rating": 4.95,
            },
            {
                "id": "mentor-dr-sneha",
                "user_id": "user-mentor-sneha-02",
                "full_name": "Dr. Sneha Rao",
                "designation": "Assistant Professor & UGC-NET Qualified Senior Fellow",
                "specialization": "Higher Education System & Research Aptitude",
                "institution": "Bangalore University",
                "is_verified": True,
                "total_answers_resolved": 89,
                "rating": 4.88,
            },
        ]

        for mentor_item in mentor_data:
            existing_mentor = db.query(MentorProfile).filter(MentorProfile.id == mentor_item["id"]).first()
            if not existing_mentor:
                db.add(MentorProfile(**mentor_item))

        # 13. Part 5: Collaborative Study Groups (Feature 88)
        group_data = [
            {
                "id": "grp-upsc-mains-gs",
                "name": "UPSC Civil Services 2026 GS Mains Circle",
                "exam_code": "UPSC-CSE",
                "description": "Collaborative peer group focused on General Studies Paper 1-4 syllabus milestones, daily answer reviews, and official gazette tracking.",
                "category": "Peer Discussion & Answer Review",
                "member_count": 28,
                "is_active": True,
                "created_by": "system-cohort-lead",
            },
            {
                "id": "grp-kset-paper1-hub",
                "name": "KSET & UGC-NET Paper 1 Mastery Collective",
                "exam_code": "UGC-NET",
                "description": "Dedicated study group solving Teaching Aptitude, ICT, Higher Education System, and Data Interpretation PYQs with verified faculty insights.",
                "category": "PYQ & Faculty Discussion",
                "member_count": 45,
                "is_active": True,
                "created_by": "system-cohort-lead",
            },
            {
                "id": "grp-ssc-quant-reasoning",
                "name": "SSC CGL 2026 Tier-I Speed & Accuracy Sprint",
                "exam_code": "SSC-CGL",
                "description": "Timed problem solving, shortcut tricks for Quantitative Aptitude, and English Comprehension discussions.",
                "category": "Speed Drills",
                "member_count": 62,
                "is_active": True,
                "created_by": "system-cohort-lead",
            },
        ]

        for grp_item in group_data:
            existing_grp = db.query(StudyGroup).filter(StudyGroup.id == grp_item["id"]).first()
            if not existing_grp:
                db.add(StudyGroup(**grp_item))

        # 14. Part 5: Discussion Messages (Features 88 & 89)
        msg_data = [
            {
                "id": "msg-kset-01",
                "group_id": "grp-kset-paper1-hub",
                "user_id": "student-demo-rajesh",
                "author_name": "Rajesh Kumar",
                "content": "For UGC-NET / KSET Paper 1, which NEP 2020 structural reforms are most frequently asked in the Higher Education section?",
                "is_verified_mentor_answer": False,
                "likes_count": 5,
            },
            {
                "id": "msg-kset-02",
                "group_id": "grp-kset-paper1-hub",
                "user_id": "user-mentor-sneha-02",
                "author_name": "Dr. Sneha Rao (Verified Mentor)",
                "content": "Focus on the 5+3+3+4 school-to-college transition framework, the 4-year undergraduate degree with multiple entry/exit options, and the establishment of HECI (Higher Education Commission of India) with its four verticals (NHERC, NAC, HEGC, GEC). Review UGC Regulations 2023 Gazette notifications.",
                "is_verified_mentor_answer": True,
                "likes_count": 19,
            },
        ]

        for msg_item in msg_data:
            existing_msg = db.query(GroupDiscussionMessage).filter(GroupDiscussionMessage.id == msg_item["id"]).first()
            if not existing_msg:
                db.add(GroupDiscussionMessage(**msg_item))

        db.commit()

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        seed_database(session)
        print("Authoritative Indian Government Examination Database seeded successfully!")
    finally:
        session.close()
