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
from app.models.student import (
    StudentProfile,
    StudentPreference,
    SavedExam,
    StudyPlan,
    DailyStudyTask,
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

        db.commit()

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        seed_database(session)
        print("Authoritative Indian Government Examination Database seeded successfully!")
    finally:
        session.close()
