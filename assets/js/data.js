/**
 * MARGDARSHAK (SCG-GEP) - Data Repository
 * Multi-Agent AI-Based Student Career Guidance & Government Exam Preparation System
 * 
 * Comprehensive dataset covering Indian Central & State Government Examinations,
 * Public Sector Undertakings (PSUs), Defense, Banking, Teaching/Lectureship (UGC-NET / KSET),
 * Eligibility Matrix, Career Pathways, Monitored Portals, and Application Assistance.
 * 
 * NOTE: Academic Project Dataset - For educational & prototype demonstration.
 */

const GOV_EXAMS_DATA = [
  {
    id: "upsc-cse-2026",
    title: "UPSC Civil Services Examination (CSE) 2026",
    code: "UPSC-CSE",
    conductingBody: "Union Public Service Commission (UPSC)",
    level: "Central",
    category: "Civil Services",
    posts: "IAS, IPS, IFS, IRS, and Group 'A' / 'B' Central Services",
    vacancies: 1105,
    minQualification: "Bachelor's Degree in any discipline from a recognized University",
    eligibleStreams: ["Engineering/B.Tech", "Arts/Humanities", "Science/B.Sc", "Commerce/B.Com", "Medical", "Law"],
    ageLimit: {
      min: 21,
      maxGeneral: 32,
      maxOBC: 35,
      maxSCST: 37,
      maxPwD: 42
    },
    attempts: { General: 6, OBC: 9, SCST: "Unlimited up to age limit", PwD: 9 },
    payScale: "Pay Level 10 (₹56,100 - ₹1,77,500) to Cabinet Secretary Grade (₹2,50,000 fixed)",
    payLevel: "Level 10",
    salaryBasic: "₹56,100",
    salaryGross: "₹95,500/month (Class X Cities)",
    applicationFee: "₹100 (Exempted for Female/SC/ST/PwD)",
    notificationDate: "14-01-2026",
    lastDateToApply: "05-03-2026",
    prelimsDate: "24-05-2026",
    mainsDate: "18-09-2026",
    status: "Upcoming",
    officialWebsite: "https://upsc.gov.in",
    aiMatchScore: 88,
    negativeMarking: "-0.33 per wrong answer (Prelims)",
    duration: "Paper I: 2 Hours | Paper II (CSAT): 2 Hours",
    relevanceForTech: "High optionals synergy with Mathematics, Physics, or CS-adjacent subjects; lateral entry opportunities in e-Governance & digital public infrastructure.",
    stages: [
      { name: "Preliminary Exam", details: "Objective Type - Paper I (General Studies) & Paper II (CSAT Qualifying 33%)" },
      { name: "Main Examination", details: "Written Descriptive - 9 Papers (2 Qualifying Language, 1 Essay, 4 GS, 2 Optional)" },
      { name: "Personality Test", details: "Interview for 275 marks assessing intellectual caliber and public service aptitude" }
    ],
    syllabusOverview: {
      prelims: ["Current events of national & international importance", "History of India and Indian National Movement", "Indian and World Geography", "Indian Polity and Governance - Constitution, Political System, Panchayati Raj", "Economic and Social Development", "Environmental Ecology, Bio-diversity and Climate Change", "General Science"],
      mainsGS: ["GS-1: Heritage, History, Geography & Society", "GS-2: Governance, Constitution, Polity, Social Justice & IR", "GS-3: Technology, Economic Development, Bio-diversity, Security & Disaster Mgmt", "GS-4: Ethics, Integrity and Aptitude"]
    }
  },
  {
    id: "ssc-cgl-2026",
    title: "SSC Combined Graduate Level (CGL) 2026",
    code: "SSC-CGL",
    conductingBody: "Staff Selection Commission (SSC)",
    level: "Central",
    category: "Staff Selection",
    posts: "Assistant Section Officer (CSS, MEA, IB), Inspector (GST, Examiner, IT), Sub-Inspector (CBI), Auditor",
    vacancies: 14750,
    minQualification: "Bachelor's Degree in any discipline from a recognized University",
    eligibleStreams: ["Engineering/B.Tech", "Commerce/B.Com", "Science/B.Sc", "Arts/Humanities"],
    ageLimit: {
      min: 18,
      maxGeneral: 30,
      maxOBC: 33,
      maxSCST: 35,
      maxPwD: 40
    },
    payScale: "Pay Level 7 (₹44,900 - ₹1,42,400) to Level 4 (₹25,500 - ₹81,100)",
    payLevel: "Level 7",
    salaryBasic: "₹44,900",
    salaryGross: "₹74,800/month (Class X Cities)",
    applicationFee: "₹100 (Exempted for Women, SC, ST, ESM, PwD)",
    notificationDate: "10-02-2026",
    lastDateToApply: "15-03-2026",
    prelimsDate: "12-06-2026",
    mainsDate: "20-09-2026",
    status: "Active",
    officialWebsite: "https://ssc.gov.in",
    aiMatchScore: 94,
    negativeMarking: "-0.50 (Tier-I) / -1.00 (Tier-II Sectional)",
    duration: "Tier-I: 60 Minutes (100 Qs) | Tier-II: 2 Hours 15 Mins",
    relevanceForTech: "Exceptional fit for tech students; Tier-II Computer Knowledge Module and Quantitative Aptitude heavily favor analytical graduates.",
    stages: [
      { name: "Tier I (CBE)", details: "Computer Based Examination - General Intelligence, General Awareness, Quantitative Aptitude, English" },
      { name: "Tier II (CBE)", details: "Paper-I (Compulsory for all posts: Math, Reasoning, English, General Awareness, Computer Knowledge Module, Data Entry Speed Test)" }
    ],
    syllabusOverview: {
      prelims: ["Quantitative Aptitude (Arithmetic & Advanced Math)", "General Intelligence and Reasoning", "English Comprehension", "General Awareness and Static GK"],
      mainsGS: ["Mathematical Abilities", "Reasoning & General Intelligence", "English Language & Comprehension", "General Awareness", "Computer Knowledge (Hardware, Software, Internet, Cybersecurity basics)"]
    }
  },
  {
    id: "isro-scientist-sc-2026",
    title: "ISRO Centralised Recruitment Board (ICRB) - Scientist / Engineer 'SC'",
    code: "ISRO-SC",
    conductingBody: "Indian Space Research Organisation (ISRO)",
    level: "Central / Autonomous R&D",
    category: "Engineering & Technical",
    posts: "Scientist/Engineer 'SC' (Computer Science, Electronics, Mechanical)",
    vacancies: 325,
    minQualification: "B.E/B.Tech or equivalent in Computer Science / Electronics / Mechanical with aggregate minimum 65% marks or 6.84/10 CGPA",
    eligibleStreams: ["Engineering/B.Tech"],
    ageLimit: {
      min: 21,
      maxGeneral: 28,
      maxOBC: 31,
      maxSCST: 33,
      maxPwD: 38
    },
    payScale: "Level 10 of Pay Matrix (₹56,100 + DA + HRA + Special allowances approx ₹92,000/month gross)",
    payLevel: "Level 10",
    salaryBasic: "₹56,100",
    salaryGross: "₹95,000/month + Special Research Perks",
    applicationFee: "₹250 (Exempted for Women, SC, ST, PwD)",
    notificationDate: "05-01-2026",
    lastDateToApply: "28-02-2026",
    prelimsDate: "19-04-2026",
    mainsDate: "Interview in June 2026",
    status: "Active",
    officialWebsite: "https://isro.gov.in",
    aiMatchScore: 98,
    negativeMarking: "-0.33 per wrong answer",
    duration: "120 Minutes (80 Technical + 20 Aptitude Questions)",
    relevanceForTech: "Direct premier R&D role for Computer Science engineers in satellite mission software, real-time telemetry, image processing, and ground systems.",
    stages: [
      { name: "Written Test", details: "Part A (Core CS Engineering disciplines - 80 marks) & Part B (Aptitude/Reasoning - 20 marks)" },
      { name: "Interview", details: "Technical domain and research mindset evaluation (Minimum 60/100 to qualify for final selection)" }
    ],
    syllabusOverview: {
      prelims: ["Algorithms & Data Structures", "Theory of Computation & Compiler Design", "Computer Networks & Security", "Operating Systems & System Programming", "Databases (SQL & NoSQL)", "Computer Organization and Architecture", "Discrete Mathematics & Graph Theory"]
    }
  },
  {
    id: "ugc-net-cs-2026",
    title: "UGC-NET / JRF & Assistant Professor (June 2026 Session)",
    code: "UGC-NET",
    conductingBody: "National Testing Agency (NTA)",
    level: "National",
    category: "Teaching & Research",
    posts: "Junior Research Fellowship (JRF) & Assistant Professor in Indian Universities",
    vacancies: "Eligibility Based Certification",
    minQualification: "Master's Degree (M.Tech / M.Sc / MCA) or final semester of 4-year Bachelor's degree (B.Tech with 75% marks eligible for Ph.D./JRF under NEP 2020)",
    eligibleStreams: ["Engineering/B.Tech", "Science/B.Sc", "Arts/Humanities", "Commerce/B.Com"],
    ageLimit: {
      min: 21,
      maxGeneral: 30, // for JRF (no upper age limit for Assistant Professor)
      maxOBC: 33,
      maxSCST: 35,
      maxPwD: 35
    },
    payScale: "JRF Fellowship: ₹37,000/month + HRA; Assistant Professor: Academic Level 10 (₹57,700 - ₹1,82,400)",
    payLevel: "Academic Level 10",
    salaryBasic: "₹57,700",
    salaryGross: "₹92,000/month in Central Universities",
    applicationFee: "₹1,150 (General), ₹600 (OBC-NCL/EWS), ₹325 (SC/ST/PwD)",
    notificationDate: "20-03-2026",
    lastDateToApply: "25-04-2026",
    prelimsDate: "15-06-2026",
    mainsDate: "N/A (Single Phase Computer Test)",
    status: "Upcoming",
    officialWebsite: "https://ugcnet.nta.ac.in",
    aiMatchScore: 91,
    negativeMarking: "No negative marking",
    duration: "180 Minutes (No break between Paper 1 and Paper 2)",
    relevanceForTech: "Gateway for CS students targeting research careers, Indian premier institute Ph.D. admissions, and faculty roles in universities.",
    stages: [
      { name: "Paper I (General)", details: "Teaching Aptitude, Research Methodology, Comprehension, Mathematical Reasoning, Information & Communication Tech (ICT), People & Environment" },
      { name: "Paper II (Computer Science)", details: "100 MCQs covering the complete Computer Science & Applications syllabus" }
    ],
    syllabusOverview: {
      prelims: ["Paper 1: Teaching & Research Aptitude, Data Interpretation, Higher Education System"],
      mainsGS: ["Unit 1: Discrete Structures & Optimization", "Unit 2: Computer System Architecture", "Unit 3: Programming Languages & Computer Graphics", "Unit 4: Database Management Systems", "Unit 5: System Software & Operating System", "Unit 6: Software Engineering", "Unit 7: Data Communication & Computer Networks", "Unit 8: Theory of Computation & Compilers", "Unit 9: Data Science, AI & Machine Learning"]
    }
  },
  {
    id: "kset-2026",
    title: "Karnataka State Eligibility Test (KSET) 2026",
    code: "KSET",
    conductingBody: "Karnataka Examination Authority (KEA) / NTA",
    level: "State (Karnataka)",
    category: "Teaching & Research",
    posts: "Assistant Professor Eligibility in Karnataka State Universities & First Grade Colleges",
    vacancies: "State-wide Eligibility Accreditation",
    minQualification: "Master's Degree or aggregate equivalent with at least 55% marks (50% for SC/ST/OBC/PwD candidates of Karnataka)",
    eligibleStreams: ["Engineering/B.Tech", "Science/B.Sc", "Commerce/B.Com", "Arts/Humanities"],
    ageLimit: {
      min: 21,
      maxGeneral: "No upper age limit for Assistant Professor eligibility",
      maxOBC: "No limit",
      maxSCST: "No limit",
      maxPwD: "No limit"
    },
    payScale: "UGC Scale 7th CPC Academic Level 10 (₹57,700 - ₹1,82,400) in Karnataka Colleges",
    payLevel: "Academic Level 10",
    salaryBasic: "₹57,700",
    salaryGross: "₹88,000/month",
    applicationFee: "₹1,000 (Cat-IIA, IIB, IIIA, IIIB), ₹500 (Cat-I, SC, ST, PwD)",
    notificationDate: "15-02-2026",
    lastDateToApply: "30-03-2026",
    prelimsDate: "19-07-2026",
    mainsDate: "N/A (Single Day Examination)",
    status: "Upcoming",
    officialWebsite: "https://cetonline.karnataka.gov.in/kea/",
    aiMatchScore: 89,
    negativeMarking: "No negative marking",
    duration: "Paper 1: 1 Hour (50 Qs) | Paper 2: 2 Hours (100 Qs)",
    relevanceForTech: "Direct state accreditation for lecturing in Govt First Grade Colleges & technical universities in Karnataka.",
    stages: [
      { name: "Paper I", details: "General Paper on Teaching and Research Aptitude (50 compulsory questions, 100 marks)" },
      { name: "Paper II", details: "Domain Subject (Computer Science and Applications, 100 compulsory questions, 200 marks)" }
    ],
    syllabusOverview: {
      prelims: ["Teaching aptitude, Research aptitude, Reading comprehension, Reasoning, ICT, Environment, Higher education system in Karnataka & India"],
      mainsGS: ["CS Core Subjects matching UGC-NET syllabus guidelines"]
    }
  },
  {
    id: "ibps-po-2026",
    title: "IBPS Probationary Officer / Management Trainee (PO/MT-XVI)",
    code: "IBPS-PO",
    conductingBody: "Institute of Banking Personnel Selection (IBPS)",
    level: "National / Banking",
    category: "Banking & Financial Services",
    posts: "Probationary Officer in 11 Participating Public Sector Banks (PNB, Canara, BoB, etc.)",
    vacancies: 6450,
    minQualification: "Graduation degree in any discipline from a recognized University",
    eligibleStreams: ["Engineering/B.Tech", "Commerce/B.Com", "Science/B.Sc", "Arts/Humanities"],
    ageLimit: {
      min: 20,
      maxGeneral: 30,
      maxOBC: 33,
      maxSCST: 35,
      maxPwD: 40
    },
    payScale: "Basic Pay ₹36,000 + allowances (Gross monthly ₹52,000 - ₹58,000 + leased housing)",
    payLevel: "Junior Management Grade Scale I (JMGS-I)",
    salaryBasic: "₹36,000",
    salaryGross: "₹57,500/month + Leased Accommodation",
    applicationFee: "₹850 (General/EWS/OBC), ₹175 (SC/ST/PwD)",
    notificationDate: "01-08-2026",
    lastDateToApply: "28-08-2026",
    prelimsDate: "17-10-2026",
    mainsDate: "29-11-2026",
    status: "Notification Expected",
    officialWebsite: "https://ibps.in",
    aiMatchScore: 85,
    negativeMarking: "-0.25 per incorrect answer",
    duration: "Prelims: 60 Mins (Sectional 20 Mins each) | Mains: 3 Hours 30 Mins",
    relevanceForTech: "High absorption of engineers into digital banking, fintech operations, treasury tech, and rapid promotion paths to Chief Manager & AGM.",
    stages: [
      { name: "Preliminary Examination", details: "Online Objective: English Language (30 Qs), Quantitative Aptitude (35 Qs), Reasoning Ability (35 Qs)" },
      { name: "Main Examination", details: "Objective (Reasoning & Computer Aptitude, General/Economy/Banking Awareness, English, Data Analysis) + Descriptive English Essay/Letter" },
      { name: "Common Interview", details: "Conducted by Participating Banks coordinated by IBPS (100 marks)" }
    ],
    syllabusOverview: {
      prelims: ["Quantitative Aptitude (Data Interpretation, Number Series, Quadratic equations, Arithmetic)", "Reasoning Ability (Puzzles, Seating arrangement, Syllogisms, Coding)", "English Language"],
      mainsGS: ["Banking Awareness, Monetary Policy, Financial Inclusion, Computer Aptitude, Data Interpretation & Analysis"]
    }
  },
  {
    id: "sbi-po-2026",
    title: "State Bank of India (SBI) Probationary Officer 2026",
    code: "SBI-PO",
    conductingBody: "State Bank of India (Central Recruitment & Promotion Board)",
    level: "National / Banking",
    category: "Banking & Financial Services",
    posts: "Probationary Officer (Scale-I) in SBI Branches Pan-India",
    vacancies: 2000,
    minQualification: "Graduation in any discipline from a recognized University or final year appearing",
    eligibleStreams: ["Engineering/B.Tech", "Commerce/B.Com", "Science/B.Sc", "Arts/Humanities"],
    ageLimit: {
      min: 21,
      maxGeneral: 30,
      maxOBC: 33,
      maxSCST: 35,
      maxPwD: 40
    },
    payScale: "Basic Pay ₹41,960 (with 4 advance increments) Gross approx ₹68,000/mo + SBI lease",
    payLevel: "Scale I Officer",
    salaryBasic: "₹41,960",
    salaryGross: "₹68,500/month + Leased Accommodation up to ₹30,000 in Mumbai",
    applicationFee: "₹750 (General/EWS/OBC), Nil (SC/ST/PwD)",
    notificationDate: "05-09-2026",
    lastDateToApply: "27-09-2026",
    prelimsDate: "15-11-2026",
    mainsDate: "January 2027",
    status: "Upcoming",
    officialWebsite: "https://sbi.co.in",
    aiMatchScore: 86,
    negativeMarking: "-0.25 per wrong answer (Prelims & Mains)",
    duration: "Prelims: 60 Minutes | Mains: 3 Hours Objective + 30 Mins Descriptive",
    relevanceForTech: "SBI is India's largest commercial bank with leading digital banking stacks (YONO). High career growth to Deputy Managing Director.",
    stages: [
      { name: "Phase-I Preliminary Exam", details: "100 Marks: English (30 Qs), Quantitative Aptitude (35 Qs), Reasoning Ability (35 Qs)" },
      { name: "Phase-II Main Exam", details: "Objective (200 marks) + Descriptive (50 marks letter & essay writing)" },
      { name: "Phase-III Psychometric & Interview", details: "Psychometric Test, Group Exercises (20 marks) & Interview (30 marks)" }
    ],
    syllabusOverview: {
      prelims: ["Data Interpretation & Analysis", "Reasoning & Computer Aptitude", "General/Economy/Banking Awareness", "English Language"]
    }
  },
  {
    id: "rbi-grade-b-2026",
    title: "Reserve Bank of India (RBI) Grade 'B' (General) Officers 2026",
    code: "RBI-GR-B",
    conductingBody: "Reserve Bank of India Services Board",
    level: "Central / Central Banking",
    category: "Banking & Financial Services",
    posts: "Officers in Grade 'B' (General / DEPR / DSIM)",
    vacancies: 291,
    minQualification: "Graduation in any discipline with minimum 60% marks (50% for SC/ST/PwD) or Post-Graduation with 55% marks",
    eligibleStreams: ["Engineering/B.Tech", "Commerce/B.Com", "Science/B.Sc", "Arts/Humanities"],
    ageLimit: {
      min: 21,
      maxGeneral: 30,
      maxOBC: 33,
      maxSCST: 35,
      maxPwD: 40
    },
    payScale: "Basic Pay ₹55,200 + Dearness Allowance, Local Allowance, House Rent Allowance (CTC approx ₹28 Lakhs/year)",
    payLevel: "Grade B (Executive)",
    salaryBasic: "₹55,200",
    salaryGross: "₹1,16,000/month (Exclusive of RBI quarters)",
    applicationFee: "₹850 (General/OBC/EWS), ₹100 (SC/ST/PwD)",
    notificationDate: "20-06-2026",
    lastDateToApply: "15-07-2026",
    prelimsDate: "06-09-2026",
    mainsDate: "19-10-2026",
    status: "Upcoming",
    officialWebsite: "https://rbi.org.in",
    aiMatchScore: 92,
    negativeMarking: "-0.25 in Phase-I",
    duration: "Phase-I: 120 Minutes (200 Qs) | Phase-II: 3 Papers (300 Marks)",
    relevanceForTech: "Apex monetary regulator; significant opportunities in financial technology supervision, cybersecurity oversight, and CBDC (Digital Rupee).",
    stages: [
      { name: "Phase-I Online Examination", details: "Objective: General Awareness (80 Qs), Reasoning (60 Qs), English (30 Qs), Quantitative (30 Qs) - Total 200 Marks" },
      { name: "Phase-II Online Examination", details: "Paper-I: Economic & Social Issues (ESI); Paper-II: English Writing Skills; Paper-III: Finance & Management (FM)" },
      { name: "Interview", details: "75 Marks interview conducted at RBI regional headquarters" }
    ],
    syllabusOverview: {
      prelims: ["Monetary policy, macroeconomics, Union Budget, financial markets, Indian banking history, governance & management ethics"]
    }
  },
  {
    id: "nabard-grade-a-2026",
    title: "NABARD Assistant Manager (Grade 'A' - RDBS & IT) 2026",
    code: "NABARD-A",
    conductingBody: "National Bank for Agriculture and Rural Development (NABARD)",
    level: "National / Development Banking",
    category: "Banking & Financial Services",
    posts: "Assistant Manager in Grade 'A' (Rural Development Banking Service & Information Technology)",
    vacancies: 150,
    minQualification: "Bachelor's Degree in Engineering (Computer Science/IT) or any discipline with 60% marks (55% for SC/ST/PwD)",
    eligibleStreams: ["Engineering/B.Tech", "Commerce/B.Com", "Science/B.Sc"],
    ageLimit: {
      min: 21,
      maxGeneral: 30,
      maxOBC: 33,
      maxSCST: 35,
      maxPwD: 40
    },
    payScale: "Basic Pay ₹44,500 Gross approx ₹1,00,000/month with bank leased housing",
    payLevel: "Grade A Assistant Manager",
    salaryBasic: "₹44,500",
    salaryGross: "₹1,00,000/month",
    applicationFee: "₹800 (General/OBC), ₹150 (SC/ST/PwD)",
    notificationDate: "12-07-2026",
    lastDateToApply: "08-08-2026",
    prelimsDate: "20-09-2026",
    mainsDate: "November 2026",
    status: "Upcoming",
    officialWebsite: "https://nabard.org",
    aiMatchScore: 87,
    negativeMarking: "-0.25 per wrong answer",
    duration: "Phase-I: 120 Minutes (200 Qs) | Phase-II: 2 Papers (200 Marks)",
    relevanceForTech: "Agricultural fintech, cooperative banking digitalization, rural credit data infrastructure.",
    stages: [
      { name: "Phase I (Preliminary Exam)", details: "Online Objective: Reasoning, English, Computer Knowledge, Quantitative, Decision Making, General Awareness, Eco & Social Issues, Agriculture & Rural Dev (ARD)" },
      { name: "Phase II (Main Exam)", details: "Paper 1 (General English Descriptive) + Paper 2 (Economic & Social Issues / Stream Technical Paper)" },
      { name: "Interview", details: "50 Marks personal interview" }
    ],
    syllabusOverview: {
      prelims: ["Rural economics, agriculture technology, decision making, Indian financial systems"]
    }
  },
  {
    id: "lic-aao-2026",
    title: "LIC Assistant Administrative Officer (AAO - Generalist & IT) 2026",
    code: "LIC-AAO",
    conductingBody: "Life Insurance Corporation of India (LIC)",
    level: "National / Insurance PSU",
    category: "Banking & Financial Services",
    posts: "Assistant Administrative Officer (Generalist / IT / Chartered Accountant / Actuarial)",
    vacancies: 300,
    minQualification: "Bachelor's / Master's Degree in Computer Science / IT / any discipline from recognized University",
    eligibleStreams: ["Engineering/B.Tech", "Commerce/B.Com", "Science/B.Sc"],
    ageLimit: {
      min: 21,
      maxGeneral: 30,
      maxOBC: 33,
      maxSCST: 35,
      maxPwD: 40
    },
    payScale: "Basic Pay ₹53,600 Pay scale ₹53,600 - ₹1,02,090 (Gross approx ₹92,870/month)",
    payLevel: "Class-I Officer",
    salaryBasic: "₹53,600",
    salaryGross: "₹92,870/month (Class A Cities)",
    applicationFee: "₹700 (General/OBC/EWS), ₹85 (SC/ST/PwD)",
    notificationDate: "15-01-2026",
    lastDateToApply: "10-02-2026",
    prelimsDate: "18-04-2026",
    mainsDate: "June 2026",
    status: "Upcoming",
    officialWebsite: "https://licindia.in",
    aiMatchScore: 84,
    negativeMarking: "-0.25 per wrong answer",
    duration: "Prelims: 60 Mins (100 Qs) | Mains: 120 Mins + 30 Mins Descriptive",
    relevanceForTech: "Exceptional work-life balance (5-day week) in India's sovereign insurance company with robust IT departments in Mumbai.",
    stages: [
      { name: "Phase-I Preliminary Exam", details: "Reasoning Ability (35 Qs), Quantitative Aptitude (35 Qs), English Language with emphasis on grammar (30 Qs - Qualifying)" },
      { name: "Phase-II Main Exam", details: "Reasoning (90 marks), General Knowledge (60 marks), Data Analysis (90 marks), Insurance & Financial Market Awareness (60 marks) + Descriptive Essay/Letter" },
      { name: "Interview", details: "60 Marks personal interview" }
    ],
    syllabusOverview: {
      prelims: ["Insurance principles, financial markets, advanced data interpretation, quantitative problem solving"]
    }
  },
  {
    id: "rrb-ntpc-2026",
    title: "Railway Recruitment Board (RRB) NTPC Graduate Level 2026",
    code: "RRB-NTPC",
    conductingBody: "Railway Recruitment Control Board (Ministry of Railways)",
    level: "Central / Indian Railways",
    category: "Railways",
    posts: "Station Master, Goods Train Manager, Chief Commercial cum Ticket Supervisor, Senior Clerk",
    vacancies: 8113,
    minQualification: "University Degree or its equivalent from a recognized University",
    eligibleStreams: ["Engineering/B.Tech", "Science/B.Sc", "Commerce/B.Com", "Arts/Humanities"],
    ageLimit: {
      min: 18,
      maxGeneral: 36, // with 3-year COVID relaxation
      maxOBC: 39,
      maxSCST: 41,
      maxPwD: 46
    },
    payScale: "Pay Level 6 (₹35,400 - ₹1,12,400) and Level 5 (₹29,200 - ₹92,300) + Railway Perks",
    payLevel: "Level 6",
    salaryBasic: "₹35,400",
    salaryGross: "₹62,000/month + Running Allowances & Free Railway Passes",
    applicationFee: "₹500 (₹400 refunded upon attending CBT-1), ₹250 for SC/ST/Women/PwD",
    notificationDate: "14-09-2025",
    lastDateToApply: "20-10-2025",
    prelimsDate: "05-04-2026",
    mainsDate: "August 2026",
    status: "Admit Card Soon",
    officialWebsite: "https://indianrailways.gov.in",
    aiMatchScore: 82,
    negativeMarking: "-0.33 per wrong answer (1/3rd penalty)",
    duration: "CBT-1: 90 Minutes (100 Qs) | CBT-2: 90 Minutes (120 Qs)",
    relevanceForTech: "Vast administrative and operational responsibilities with unmatched job security and pan-India railway privileges.",
    stages: [
      { name: "1st Stage Computer Based Test (CBT-1)", details: "Screening test: General Awareness (40 Qs), Mathematics (30 Qs), General Intelligence & Reasoning (30 Qs)" },
      { name: "2nd Stage Computer Based Test (CBT-2)", details: "Scoring test with higher difficulty: GA (50 Qs), Math (35 Qs), Reasoning (35 Qs)" },
      { name: "CBAT / Typing Skill Test", details: "Computer Based Aptitude Test for Station Master; Typing Test for Senior Clerk" }
    ],
    syllabusOverview: {
      prelims: ["General Science, Current Affairs, Indian History & Geography, Freedom Struggle, Railways Heritage, Basic Math & Reasoning"]
    }
  },
  {
    id: "rrb-je-2026",
    title: "Railway Recruitment Board (RRB) Junior Engineer (JE / IT) 2026",
    code: "RRB-JE",
    conductingBody: "Railway Recruitment Control Board",
    level: "Central / Railways",
    category: "Railways",
    posts: "Junior Engineer (Information Technology, Electronics, Civil, Electrical, Mechanical)",
    vacancies: 7951,
    minQualification: "B.E/B.Tech or 3-Year Diploma in Computer Science/IT/ECE/Civil/Mech or PGDCA/B.Sc CS",
    eligibleStreams: ["Engineering/B.Tech", "Science/B.Sc"],
    ageLimit: {
      min: 18,
      maxGeneral: 36,
      maxOBC: 39,
      maxSCST: 41,
      maxPwD: 46
    },
    payScale: "Pay Level 6 of 7th CPC (₹35,400 - ₹1,12,400) + Railway DA/HRA",
    payLevel: "Level 6",
    salaryBasic: "₹35,400",
    salaryGross: "₹63,500/month",
    applicationFee: "₹500 (₹400 refunded on CBT-1 attendance), ₹250 (SC/ST/Women)",
    notificationDate: "28-07-2026",
    lastDateToApply: "29-08-2026",
    prelimsDate: "10-11-2026",
    mainsDate: "February 2027",
    status: "Upcoming",
    officialWebsite: "https://rrbapply.gov.in",
    aiMatchScore: 93,
    negativeMarking: "-0.33 per wrong answer",
    duration: "CBT-1: 90 Minutes (100 Qs) | CBT-2: 120 Minutes (150 Qs)",
    relevanceForTech: "Direct technical engineering role in Indian Railways signalling, track maintenance systems, IT networks, and locomotive computerized controls.",
    stages: [
      { name: "CBT Stage-I", details: "Math (30 Qs), General Intelligence (25 Qs), General Awareness (15 Qs), General Science (30 Qs)" },
      { name: "CBT Stage-II", details: "General Awareness (15 Qs), Physics & Chemistry (15 Qs), Basics of Computers (10 Qs), Environmental Basics (10 Qs), Core Technical Domain (100 Qs)" }
    ],
    syllabusOverview: {
      prelims: ["Data Structures, DBMS, Operating Systems, Computer Networks, Digital Electronics, C/C++"]
    }
  },
  {
    id: "nic-scientist-tech-2026",
    title: "National Informatics Centre (NIC) - Scientist 'B' & Scientific Officer",
    code: "NIC-TECH",
    conductingBody: "National Institute of Electronics and Information Technology (NIELIT) / MeitY",
    level: "Central / IT & e-Governance",
    category: "Engineering & Technical",
    posts: "Scientist 'B' & Scientific/Technical Assistant 'A'",
    vacancies: 598,
    minQualification: "B.E / B.Tech in Computer Science / Information Technology / Electronics or MCA / M.Sc CS",
    eligibleStreams: ["Engineering/B.Tech"],
    ageLimit: {
      min: 21,
      maxGeneral: 30,
      maxOBC: 33,
      maxSCST: 35,
      maxPwD: 40
    },
    payScale: "Scientist 'B': Level 10 (₹56,100 - ₹1,77,500); Tech Assistant: Level 6 (₹35,400 - ₹1,12,400)",
    payLevel: "Level 10",
    salaryBasic: "₹56,100",
    salaryGross: "₹95,000/month in New Delhi / State Capitals",
    applicationFee: "₹800 (Exempted for SC, ST, PwD, Women)",
    notificationDate: "12-03-2026",
    lastDateToApply: "15-04-2026",
    prelimsDate: "28-06-2026",
    mainsDate: "Interview in August 2026",
    status: "Upcoming",
    officialWebsite: "https://www.calicut.nielit.in",
    aiMatchScore: 99,
    negativeMarking: "-0.25 per wrong answer",
    duration: "180 Minutes (120 Questions: 78 CS Technical + 42 Generic)",
    relevanceForTech: "The highest direct tech match for B.Tech CSE graduates; build National Digital Stack (DigiLocker, UPI, e-Hospital, Aarogya Setu, GSTN).",
    stages: [
      { name: "Written Examination (OMR/CBT)", details: "65% Technical Computer Science questions, 35% Generic Aptitude & Reasoning" },
      { name: "Interview", details: "Direct interview for Scientist 'B' (85% written + 15% interview weightage); No interview for Tech Assistant" }
    ],
    syllabusOverview: {
      prelims: ["Data Structures, OOP with C++/Java/Python, DBMS, OS, Computer Networks, Web Technologies, Cloud Computing, Cyber Security, Software Engineering, AI & Data Science basics"]
    }
  },
  {
    id: "drdo-ceptam-2026",
    title: "DRDO CEPTAM-11 (Senior Technical Assistant 'B' - CS)",
    code: "DRDO-STA",
    conductingBody: "Defence Research and Development Organisation (DRDO)",
    level: "Central / Defense R&D",
    category: "Defense & Police",
    posts: "Senior Technical Assistant 'B' (STA-B) - Computer Science",
    vacancies: 480,
    minQualification: "B.Sc (Computer Science) or Diploma / B.Tech in Computer Engineering / Information Technology",
    eligibleStreams: ["Engineering/B.Tech", "Science/B.Sc"],
    ageLimit: {
      min: 18,
      maxGeneral: 28,
      maxOBC: 31,
      maxSCST: 33,
      maxPwD: 38
    },
    payScale: "Pay Level 6 (₹35,400 - ₹1,12,400) + Defense Research Allowances",
    payLevel: "Level 6",
    salaryBasic: "₹35,400",
    salaryGross: "₹64,200/month",
    applicationFee: "₹100 (Exempted for SC/ST/PwD/Women)",
    notificationDate: "08-04-2026",
    lastDateToApply: "08-05-2026",
    prelimsDate: "12-07-2026",
    mainsDate: "Tier-II CBT in September 2026",
    status: "Upcoming",
    officialWebsite: "https://drdo.gov.in",
    aiMatchScore: 95,
    negativeMarking: "No negative marking in CEPTAM screening",
    duration: "Tier-I: 90 Minutes (120 Qs) | Tier-II: 90 Minutes (100 Qs)",
    relevanceForTech: "Cyber warfare, defense avionics, missile guidance systems software, and high-performance computing labs across India.",
    stages: [
      { name: "Tier I CBT", details: "Screening Test: Quantitative Ability, General Intelligence, English, General Science (120 marks)" },
      { name: "Tier II CBT", details: "Domain Specific Computer Science Test (100 marks for provisional selection)" }
    ],
    syllabusOverview: {
      prelims: ["Mathematics, General Awareness, Reasoning, English"],
      mainsGS: ["Computer Architecture, Operating Systems, Computer Networks, Database Systems, Network Security, Embedded Systems"]
    }
  },
  {
    id: "kpsc-kas-2026",
    title: "Karnataka Administrative Services (KAS) - Gazetted Probationers 2026",
    code: "KPSC-KAS",
    conductingBody: "Karnataka Public Service Commission (KPSC)",
    level: "State (Karnataka)",
    category: "Civil Services",
    posts: "Assistant Commissioner (Revenue), Tahsildar (Grade-2), DySP, Commercial Tax Officer",
    vacancies: 384,
    minQualification: "Bachelor's Degree in any stream from a recognized University",
    eligibleStreams: ["Engineering/B.Tech", "Arts/Humanities", "Commerce/B.Com", "Science/B.Sc"],
    ageLimit: {
      min: 21,
      maxGeneral: 38,
      maxOBC: 41, // 2A, 2B, 3A, 3B
      maxSCST: 43,
      maxPwD: 48
    },
    payScale: "Group A: ₹52,650 - ₹97,100; Group B: ₹43,100 - ₹83,900 (Karnataka State Scales)",
    payLevel: "Group A Gazetted",
    salaryBasic: "₹52,650",
    salaryGross: "₹88,000/month + Govt Vehicle & Quarters",
    applicationFee: "₹600 (General), ₹300 (Cat 2A/2B/3A/3B), ₹50 (SC/ST/Cat-1)",
    notificationDate: "18-01-2026",
    lastDateToApply: "10-03-2026",
    prelimsDate: "14-06-2026",
    mainsDate: "October 2026",
    status: "Active",
    officialWebsite: "https://kpsc.kar.nic.in",
    aiMatchScore: 86,
    negativeMarking: "-0.25 per wrong answer (Prelims)",
    duration: "Paper 1: 2 Hours (100 Qs) | Paper 2: 2 Hours (100 Qs)",
    relevanceForTech: "State administration leadership; modern governance demands digitizing revenue, land records (Bhoomi), and citizen service portals.",
    stages: [
      { name: "Preliminary Exam", details: "Paper 1 (GS & Humanities - 100 Qs) + Paper 2 (GS, State admin, Aptitude - 100 Qs)" },
      { name: "Main Exam", details: "Written Descriptive - 7 papers including Kannada, English, and 4 General Studies papers" },
      { name: "Personality Test", details: "50 marks viva-voce assessing knowledge of Karnataka culture, socio-economics and public service" }
    ],
    syllabusOverview: {
      prelims: ["Karnataka History, Geography, Economy, Panchayati Raj, Current Affairs, Kannada Language comprehension basics"],
      mainsGS: ["GS-1: History & Cultural Heritage of Karnataka & India", "GS-2: Indian Constitution, State Governance & Public Admin", "GS-3: Science & Tech, Environment & State Natural Resources", "GS-4: Ethics & Management in Governance"]
    }
  },
  {
    id: "uppsc-pcs-2026",
    title: "UPPSC Combined State / Upper Subordinate Services (PCS) 2026",
    code: "UPPSC-PCS",
    conductingBody: "Uttar Pradesh Public Service Commission (UPPSC)",
    level: "State (Uttar Pradesh)",
    category: "Civil Services",
    posts: "Sub-Divisional Magistrate (SDM), DySP, Block Development Officer, ARTO",
    vacancies: 620,
    minQualification: "Bachelor's Degree in any discipline from a recognized University",
    eligibleStreams: ["Engineering/B.Tech", "Arts/Humanities", "Commerce/B.Com", "Science/B.Sc"],
    ageLimit: {
      min: 21,
      maxGeneral: 40,
      maxOBC: 45,
      maxSCST: 45,
      maxPwD: 55
    },
    payScale: "Pay Level 10 (₹56,100 - ₹1,77,500) and Level 7 (₹44,900 - ₹1,42,400)",
    payLevel: "Level 10",
    salaryBasic: "₹56,100",
    salaryGross: "₹91,000/month",
    applicationFee: "₹125 (General/OBC), ₹65 (SC/ST), ₹25 (PwD)",
    notificationDate: "01-01-2026",
    lastDateToApply: "02-02-2026",
    prelimsDate: "07-07-2026",
    mainsDate: "December 2026",
    status: "Upcoming",
    officialWebsite: "https://uppsc.up.nic.in",
    aiMatchScore: 85,
    negativeMarking: "-0.33 per wrong answer",
    duration: "Paper 1: 2 Hours (150 Qs) | Paper 2 (CSAT): 2 Hours (100 Qs)",
    relevanceForTech: "Largest state administrative apparatus with e-District, citizen digital stacks, and infrastructure monitoring initiatives.",
    stages: [
      { name: "Preliminary Exam", details: "Paper-I (General Studies - 200 marks) & Paper-II (CSAT Qualifying 33% - 200 marks)" },
      { name: "Mains Exam", details: "8 Descriptive Papers including General Hindi, Essay, 4 General Studies, 2 UP Special Papers" },
      { name: "Interview", details: "100 marks personal interview" }
    ],
    syllabusOverview: {
      prelims: ["Indian History, Polity, UP Special History & Economy, Environment, CSAT Reasoning"]
    }
  },
  {
    id: "gate-psu-2026",
    title: "GATE 2026 - PSU Executive Trainee Recruitment (IOCL, NTPC, ONGC, BHEL, BARC)",
    code: "GATE-PSU",
    conductingBody: "IIT Guwahati / Participating Maharatna & Navratna PSUs",
    level: "National / PSU",
    category: "Engineering & Technical",
    posts: "Executive Engineer Trainee, Graduate Trainee, Scientific Officer (BARC)",
    vacancies: 3500,
    minQualification: "B.E / B.Tech in CSE / IT / ECE / ME / EE with minimum 60% or 6.5 CGPA",
    eligibleStreams: ["Engineering/B.Tech"],
    ageLimit: {
      min: 21,
      maxGeneral: 28,
      maxOBC: 31,
      maxSCST: 33,
      maxPwD: 38
    },
    payScale: "E-2 Grade (₹60,000 - ₹1,80,000) CTC approx ₹18 - ₹24 Lakhs per Annum (INR)",
    payLevel: "E-2 Executive Grade",
    salaryBasic: "₹60,000",
    salaryGross: "₹1,20,000/month (CTC ₹21 LPA)",
    applicationFee: "₹1,800 (General), ₹900 (Female/SC/ST/PwD)",
    notificationDate: "24-08-2025",
    lastDateToApply: "12-10-2025",
    prelimsDate: "07-02-2026",
    mainsDate: "PSU Interviews April - July 2026",
    status: "Results Declared / PSU Shortlisting",
    officialWebsite: "https://gate2026.iitg.ac.in",
    aiMatchScore: 97,
    negativeMarking: "-0.33 for 1-mark Qs, -0.66 for 2-mark Qs",
    duration: "180 Minutes (65 Questions, 100 Marks)",
    relevanceForTech: "Direct recruitment into India's premier Maharatna public sector companies with highest starting CTC and research facilities.",
    stages: [
      { name: "GATE Online Test", details: "65 Questions, 100 Marks (15 Marks General Aptitude + 13 Marks Engineering Math + 72 Marks Core CS)" },
      { name: "PSU Group Discussion & Interview", details: "Top percentile rank holders (All India Rank 1 - 500) called for direct interviews" }
    ],
    syllabusOverview: {
      prelims: ["Engineering Mathematics, Discrete Mathematics, Data Structures, Algorithms, Theory of Computation, Compiler Design, OS, DBMS, Computer Networks"]
    }
  },
  {
    id: "ib-acio-2026",
    title: "Intelligence Bureau (IB) - ACIO Grade-II / Tech Examination 2026",
    code: "IB-ACIO",
    conductingBody: "Ministry of Home Affairs (MHA)",
    level: "Central / Intelligence & Security",
    category: "Defense & Police",
    posts: "Assistant Central Intelligence Officer (ACIO-II/Tech)",
    vacancies: 226,
    minQualification: "B.E or B.Tech in Computer Science / Information Technology / Electronics or Master's in Science",
    eligibleStreams: ["Engineering/B.Tech", "Science/B.Sc"],
    ageLimit: {
      min: 18,
      maxGeneral: 27,
      maxOBC: 30,
      maxSCST: 32,
      maxPwD: 37
    },
    payScale: "Level 7 (₹44,900 - ₹1,42,400) + 20% Special Security Allowance",
    payLevel: "Level 7",
    salaryBasic: "₹44,900",
    salaryGross: "₹84,000/month (Includes 20% SSA)",
    applicationFee: "₹500 (₹450 recruitment processing charge + ₹50 exam fee)",
    notificationDate: "16-01-2026",
    lastDateToApply: "18-02-2026",
    prelimsDate: "10-05-2026",
    mainsDate: "Interview July 2026",
    status: "Active",
    officialWebsite: "https://mha.gov.in",
    aiMatchScore: 93,
    negativeMarking: "-0.25 per wrong answer",
    duration: "Tier-I: 60 Minutes (100 Qs)",
    relevanceForTech: "National security cybersecurity division, cryptographic analysis, intelligence signals intercept, and counter-terror tech.",
    stages: [
      { name: "GATE Score / Written Test", details: "Shortlisting on valid GATE CS/EC score or computer-based screening" },
      { name: "Technical Interview", details: "High-level technical domain interview (175 marks) in New Delhi" }
    ],
    syllabusOverview: {
      prelims: ["Computer Networks, Cryptography, Network Security, Forensics, Python/C internals, Operating Systems"]
    }
  },
  {
    id: "upsc-cds-2026",
    title: "UPSC Combined Defence Services Examination (CDS-I) 2026",
    code: "UPSC-CDS",
    conductingBody: "Union Public Service Commission (UPSC)",
    level: "Central / Armed Forces",
    category: "Defense & Police",
    posts: "Commissioned Officers in Indian Military Academy (IMA), Naval Academy (INA), Air Force Academy (AFA), OTA",
    vacancies: 457,
    minQualification: "Degree of a recognized University (Degree in Engineering required for INA & AFA)",
    eligibleStreams: ["Engineering/B.Tech", "Science/B.Sc", "Commerce/B.Com", "Arts/Humanities"],
    ageLimit: {
      min: 19,
      maxGeneral: 24,
      maxOBC: 24, // No reservation in Armed Forces commissioned ranks
      maxSCST: 24,
      maxPwD: "Ineligible (Strict Military Medical Standards)"
    },
    payScale: "Lieutenant (Level 10: ₹56,100 - ₹1,77,500) + Military Service Pay ₹15,500/month",
    payLevel: "Level 10 (Armed Forces)",
    salaryBasic: "₹56,100",
    salaryGross: "₹1,05,000/month + Full Military Perks",
    applicationFee: "₹200 (Exempted for Female/SC/ST)",
    notificationDate: "20-12-2025",
    lastDateToApply: "09-01-2026",
    prelimsDate: "13-04-2026",
    mainsDate: "SSB Interview July - Oct 2026",
    status: "Active",
    officialWebsite: "https://upsc.gov.in",
    aiMatchScore: 89,
    negativeMarking: "-0.33 per wrong answer",
    duration: "English (2 Hrs), General Knowledge (2 Hrs), Elementary Math (2 Hrs)",
    relevanceForTech: "Commissioned technical arm service (Corps of Signals, Electrical & Mechanical Engineers EME, Naval Technical Cadre).",
    stages: [
      { name: "Written Examination", details: "English (100 marks), General Knowledge (100 marks), Elementary Mathematics (100 marks)" },
      { name: "SSB Interview (5-Day Process)", details: "Stage-I (OIR & PPDT) and Stage-II (Psychology tests, GTO tasks, Personal Interview, Conference)" }
    ],
    syllabusOverview: {
      prelims: ["Arithmetic, Algebra, Trigonometry, Geometry, Modern Indian History, Physics/Chemistry basics, English Grammar"]
    }
  },
  {
    id: "afcat-2026",
    title: "Air Force Common Admission Test (AFCAT 01/2026)",
    code: "AFCAT",
    conductingBody: "Indian Air Force (IAF)",
    level: "Central / Air Force",
    category: "Defense & Police",
    posts: "Flying Branch & Ground Duty (Technical & Non-Technical) Officers",
    vacancies: 317,
    minQualification: "B.E/B.Tech degree with minimum 60% marks in CS/ECE/Mechanical or Graduation with 60% marks and 50% in 12th Math & Physics",
    eligibleStreams: ["Engineering/B.Tech", "Science/B.Sc"],
    ageLimit: {
      min: 20,
      maxGeneral: 26, // For Ground Duty Technical
      maxOBC: 26,
      maxSCST: 26,
      maxPwD: "Ineligible"
    },
    payScale: "Flying Officer: Pay Level 10 (₹56,100 - ₹1,77,500) + MSP ₹15,500/month + Flying/Tech allowances",
    payLevel: "Level 10 (IAF)",
    salaryBasic: "₹56,100",
    salaryGross: "₹1,02,000/month",
    applicationFee: "₹550 for all candidates",
    notificationDate: "01-12-2025",
    lastDateToApply: "30-12-2025",
    prelimsDate: "21-02-2026",
    mainsDate: "AFSB Interview April - July 2026",
    status: "Active",
    officialWebsite: "https://afcat.cdac.in",
    aiMatchScore: 91,
    negativeMarking: "-1 mark per wrong answer (+3 for correct)",
    duration: "120 Minutes (100 Questions, 300 Marks)",
    relevanceForTech: "Direct appointment as Aeronautical Engineer (Electronics/Computers) managing IAF radar networks, AWACS, avionics software, and UAVs.",
    stages: [
      { name: "AFCAT Online CBT", details: "General Awareness, Verbal Ability in English, Numerical Ability and Reasoning and Military Aptitude Test" },
      { name: "AFSB Testing (Air Force Selection Board)", details: "Stage-I Testing, Stage-II Psychological & Group Tasks, Computerized Pilot Selection System (CPSS for Flying)" }
    ],
    syllabusOverview: {
      prelims: ["Spatial ability, verbal reasoning, military history, Indian geography, high school algebra"]
    }
  }
];

const DEFAULT_STUDENT_PROFILE = {
  fullName: "Demo Student",
  email: "student@example.edu",
  mobile: "",
  rollNumber: "",
  category: "General",
  domicileState: "Karnataka",
  dob: "2002-08-15",
  qualifications: [{
    level: "Undergraduate",
    degree: "B.Tech in Computer Science & Engineering",
    branch: "Computer Science & Engineering",
    cgpa: 8.4,
    year: 2026,
    institution: ""
  }],
  targetExams: ["ISRO-SC", "SSC-CGL", "UGC-NET", "KSET"],
  bookmarkedExams: ["isro-scientist-sc-2026", "ssc-cgl-2026", "ugc-net-cs-2026", "kset-2026"],
  checklistProgress: {}
};

const GOV_NOTIFICATIONS_DATA = [
  {
    id: "sample-upsc-cse",
    agency: "UPSC",
    category: "Examination",
    number: "SAMPLE-CSP-2026",
    title: "Civil Services Examination — sample listing",
    summary: "Illustrative record only. Check the UPSC website for current notices, dates, and eligibility.",
    date: "Sample data",
    urgency: "Normal",
    isRead: false,
    pdfSize: "Not supplied",
    linkUrl: "https://upsc.gov.in/"
  },
  {
    id: "sample-ssc-cgl",
    agency: "SSC",
    category: "Recruitment",
    number: "SAMPLE-CGL-2026",
    title: "Combined Graduate Level — sample listing",
    summary: "Illustrative record only. This prototype does not confirm a live recruitment or application window.",
    date: "Sample data",
    urgency: "Normal",
    isRead: false,
    pdfSize: "Not supplied",
    linkUrl: "https://ssc.gov.in/"
  },
  {
    id: "sample-kset",
    agency: "KEA / KSET",
    category: "Teaching",
    number: "SAMPLE-KSET-2026",
    title: "Karnataka State Eligibility Test — sample listing",
    summary: "Illustrative record only. Refer to KEA for current KSET information.",
    date: "Sample data",
    urgency: "Normal",
    isRead: false,
    pdfSize: "Not supplied",
    linkUrl: "https://cetonline.karnataka.gov.in/kea/"
  }
];

const MOCK_QUESTIONS_DATA = [
  {
    subject: "Indian Polity",
    question: "Which part of the Constitution of India contains the Directive Principles of State Policy?",
    options: ["Part II", "Part III", "Part IV", "Part V"],
    correctAnswer: 2,
    explanation: "The Directive Principles of State Policy are contained in Part IV."
  },
  {
    subject: "Computer Science",
    question: "Which data structure is commonly used to manage function calls?",
    options: ["Queue", "Stack", "Graph", "Hash table"],
    correctAnswer: 1,
    explanation: "Function calls and their local state are managed using a call stack."
  },
  {
    subject: "Quantitative Aptitude",
    question: "A value increases from 80 to 100. What is the percentage increase?",
    options: ["20%", "25%", "15%", "30%"],
    correctAnswer: 1,
    explanation: "The increase is 20; 20 divided by the original value 80 is 25%."
  },
  {
    subject: "Reasoning",
    question: "If all roses are flowers and some flowers fade quickly, which conclusion is certain?",
    options: ["All roses fade quickly", "Some roses fade quickly", "All roses are flowers", "No flowers are roses"],
    correctAnswer: 2,
    explanation: "Only the first statement is guaranteed by the information given."
  },
  {
    subject: "Computer Science",
    question: "What is the average-case time complexity of binary search on a sorted array?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 1,
    explanation: "Binary search halves the remaining search interval at each step."
  }
];

/**
 * Government Job Roles / Posts Database (Module B - Feature 8 & 16)
 */
const GOV_JOBS_DATABASE = [
  {
    id: "job-001",
    postTitle: "Scientist / Engineer 'SC' (Computer Science)",
    department: "Indian Space Research Organisation (ISRO) / Dept of Space",
    cadre: "Group 'A' Gazetted (Scientific & Technical)",
    examId: "isro-scientist-sc-2026",
    examCode: "ISRO-SC",
    minQualification: "B.E / B.Tech in Computer Science & Engineering with min 65% aggregate or 6.84 CGPA",
    eligibleBranch: "Computer Science & Engineering / Information Technology",
    payMatrixLevel: "Level 10 (7th CPC)",
    basicPay: "₹56,100",
    grossMonthlySalary: "₹95,200",
    inHandApprox: "₹79,500/month",
    allowances: "50% DA (₹28,050) + 30% HRA (₹16,830) + Transport Allowance (₹7,200) + Professional Update Allowance",
    officialSource: "ISRO ICRB Central Gazette (Advt ICRB:02:2026)",
    sourceVerifiedDate: "15-01-2026",
    workProfile: "Telemetry mission systems, satellite payload software, real-time ground control OS, cryptographic uplink/downlink, AI for remote sensing.",
    postingLocations: "URSC Bengaluru, VSSC Thiruvananthapuram, SAC Ahmedabad, NRSC Hyderabad"
  },
  {
    id: "job-002",
    postTitle: "Assistant Section Officer (ASO) in Central Secretariat Service (CSS)",
    department: "Ministry of Personnel, Public Grievances and Pensions (DoPT) / Central Ministries",
    cadre: "Group 'B' Non-Gazetted",
    examId: "ssc-cgl-2026",
    examCode: "SSC-CGL",
    minQualification: "Bachelor's Degree in any discipline from a recognized University",
    eligibleBranch: "All Streams (Engineering, Arts, Science, Commerce)",
    payMatrixLevel: "Level 7 (7th CPC)",
    basicPay: "₹44,900",
    grossMonthlySalary: "₹76,400",
    inHandApprox: "₹63,800/month",
    allowances: "50% DA (₹22,450) + 30% HRA Delhi (₹13,470) + TA (₹5,400) + CGHS Health Cover",
    officialSource: "SSC Combined Graduate Level Notification (F. No. HQ-PPII03)",
    sourceVerifiedDate: "10-02-2026",
    workProfile: "Central policy drafting, cabinet note processing, RTI appeals, inter-ministerial coordination in North Block, South Block, and Shastri Bhawan.",
    postingLocations: "New Delhi (Permanent posting with fixed 5-day working week)"
  },
  {
    id: "job-003",
    postTitle: "Scientist 'B' (Software Architecture & Cyber Security)",
    department: "National Informatics Centre (NIC) / Ministry of Electronics & IT (MeitY)",
    cadre: "Group 'A' Gazetted (Scientific & Technical)",
    examId: "nic-scientist-tech-2026",
    examCode: "NIC-TECH",
    minQualification: "B.Tech in Computer Science / IT / Electronics or MCA / M.Sc Computer Science",
    eligibleBranch: "Computer Science & Engineering, IT, Software Systems",
    payMatrixLevel: "Level 10 (7th CPC)",
    basicPay: "₹56,100",
    grossMonthlySalary: "₹94,800",
    inHandApprox: "₹78,900/month",
    allowances: "50% DA + 30% HRA + Travel Allowance + Mobile & Broadband reimbursement",
    officialSource: "NIELIT / NIC Official Recruitment Portal",
    sourceVerifiedDate: "12-03-2026",
    workProfile: "Architecting Digital India platforms: DigiLocker, e-Courts, UPI integration, PM-Kisan portal, cybersecurity red-teaming, cloud infrastructure.",
    postingLocations: "NIC HQ New Delhi, State Secretariats, District NIC Centres Pan-India"
  },
  {
    id: "job-004",
    postTitle: "Assistant Commissioner of Commercial Taxes / Tahsildar (Grade-2)",
    department: "Revenue & Finance Department, Government of Karnataka",
    cadre: "Group 'A' / Group 'B' Gazetted (State Civil Service)",
    examId: "kpsc-kas-2026",
    examCode: "KPSC-KAS",
    minQualification: "Bachelor's Degree in any stream from recognized University",
    eligibleBranch: "All Disciplines",
    payMatrixLevel: "State Scale ₹52,650 - ₹97,100 (Group A)",
    basicPay: "₹52,650",
    grossMonthlySalary: "₹88,200",
    inHandApprox: "₹74,500/month",
    allowances: "State Dearness Allowance + HRA + District Travel Allowance + Official Vehicle with Driver",
    officialSource: "KPSC Gazetted Probationers Notification (PSC 41 E(1))",
    sourceVerifiedDate: "18-01-2026",
    workProfile: "Sub-divisional revenue management, GST recovery, land tribunal adjudication (Bhoomi), disaster relief coordination, protocol enforcement.",
    postingLocations: "District Collectorates & Taluk Offices across Karnataka"
  },
  {
    id: "job-005",
    postTitle: "Assistant Manager (Grade 'B' General)",
    department: "Reserve Bank of India (RBI)",
    cadre: "Executive Management Officer",
    examId: "rbi-grade-b-2026",
    examCode: "RBI-GR-B",
    minQualification: "Graduation with minimum 60% marks in aggregate",
    eligibleBranch: "Any Graduate (Engineering graduates preferred for FinTech)",
    payMatrixLevel: "Grade B (RBI Special Scale)",
    basicPay: "₹55,200",
    grossMonthlySalary: "₹1,16,400",
    inHandApprox: "₹96,000/month",
    allowances: "Special Prerequisite Allowance + Grade Allowance + Local Compensatory Allowance + Leased Apartment in RBI Officers Quarters",
    officialSource: "RBI Services Board Notification",
    sourceVerifiedDate: "20-01-2026",
    workProfile: "Monetary policy analysis, foreign exchange regulation, bank inspection & auditing, financial stability reports, payment system oversight.",
    postingLocations: "Mumbai (Central Office), Bengaluru, New Delhi, Chennai, Kolkata Regional Offices"
  },
  {
    id: "job-006",
    postTitle: "Station Master (Traffic Operations)",
    department: "Ministry of Railways (Indian Railways)",
    cadre: "Group 'C' Supervisory",
    examId: "rrb-ntpc-2026",
    examCode: "RRB-NTPC",
    minQualification: "University Degree in any discipline",
    eligibleBranch: "All Disciplines",
    payMatrixLevel: "Level 6 (7th CPC)",
    basicPay: "₹35,400",
    grossMonthlySalary: "₹63,200",
    inHandApprox: "₹52,000/month",
    allowances: "50% DA + Night Duty Allowance + Stress Allowance + Free Railway Passes for family nationwide",
    officialSource: "Railway Recruitment Control Board CEN 05/2024",
    sourceVerifiedDate: "14-09-2025",
    workProfile: "Supervision of train movements, electronic interlocking signal control, passenger amenity management, emergency safety protocol execution.",
    postingLocations: "Railway Junctions & Stations across 17 Railway Zones"
  },
  {
    id: "job-007",
    postTitle: "Assistant Professor (Computer Science & Applications)",
    department: "University Grants Commission / State & Central Universities",
    cadre: "Academic Group 'A'",
    examId: "ugc-net-cs-2026",
    examCode: "UGC-NET",
    minQualification: "Master's Degree in CS/IT/MCA with 55% or 4-Year B.Tech with 75% marks",
    eligibleBranch: "Computer Science, IT, Computer Applications",
    payMatrixLevel: "Academic Level 10 (7th CPC: ₹57,700 - ₹1,82,400)",
    basicPay: "₹57,700",
    grossMonthlySalary: "₹93,800",
    inHandApprox: "₹77,500/month",
    allowances: "50% DA + HRA + Academic Research Allowance + Sabbatical grants for international conferences",
    officialSource: "UGC Regulations on Minimum Qualifications for Appointment",
    sourceVerifiedDate: "01-02-2026",
    workProfile: "Undergraduate and postgraduate teaching, lab leadership, guiding Ph.D. scholars, publishing in Scopus/SCI journals, sponsored R&D grants.",
    postingLocations: "IITs, NITs, Central Universities, State Autonomous Engineering Colleges"
  },
  {
    id: "job-008",
    postTitle: "Assistant Central Intelligence Officer (ACIO-II / Tech)",
    department: "Intelligence Bureau (IB) / Ministry of Home Affairs",
    cadre: "Group 'C' Central Intelligence (Technical Cadre)",
    examId: "ib-acio-2026",
    examCode: "IB-ACIO",
    minQualification: "B.Tech in Computer Science / IT / Electronics",
    eligibleBranch: "Computer Science, Electronics & Communication",
    payMatrixLevel: "Level 7 (7th CPC)",
    basicPay: "₹44,900",
    grossMonthlySalary: "₹84,200",
    inHandApprox: "₹71,000/month",
    allowances: "20% Special Security Allowance (SSA) over basic pay + Cash compensation for work on holidays",
    officialSource: "Ministry of Home Affairs Gazette Notification",
    sourceVerifiedDate: "16-01-2026",
    workProfile: "Signals intelligence, telecom intercept, malware reverse-engineering, dark web tracking, digital forensics, counter-espionage tech.",
    postingLocations: "IB Headquarters New Delhi, Subsidiary Intelligence Bureaus (SIBs) Pan-India"
  }
];

/**
 * Government Information Intelligence Dataset (Module C - Features 18–28)
 * Simulated monitoring records with explicit status tags
 */
const INTELLIGENCE_DATA = {
  systemStatus: {
    engineName: "MargDarshak Autonomous Gazette Monitor V2.4",
    mode: "Academic Demonstration Sandbox",
    note: "Notice: Real-time web scraping, automatic PDF parsing, and direct database updates require backend cron runners and worker queues. Displayed records are structured demonstration fixtures.",
    lastSyncTimestamp: "20-10-2026 18:15:22 IST",
    totalMonitoredPortals: 8,
    activeAgents: ["Watchdog Monitor Agent", "PDF Extractor Agent", "Change Diff Verifier Agent"]
  },

  monitoredPortals: [
    {
      id: "portal-upsc",
      agency: "Union Public Service Commission",
      domain: "upsc.gov.in",
      url: "https://upsc.gov.in/examinations/active-examinations",
      status: "Active (200 OK)",
      frequency: "Every 15 Minutes",
      lastPing: "20-10-2026 18:10:05 IST",
      latencyMs: 142,
      sslVerified: true,
      pendingNotices: 0,
      verificationBadge: "Verified Official Source"
    },
    {
      id: "portal-ssc",
      agency: "Staff Selection Commission",
      domain: "ssc.gov.in",
      url: "https://ssc.gov.in/notices/all-notices",
      status: "Active (200 OK)",
      frequency: "Every 10 Minutes",
      lastPing: "20-10-2026 18:12:18 IST",
      latencyMs: 188,
      sslVerified: true,
      pendingNotices: 1,
      verificationBadge: "Verified Official Source"
    },
    {
      id: "portal-isro",
      agency: "ISRO Centralised Recruitment Board",
      domain: "isro.gov.in",
      url: "https://isro.gov.in/Careers.html",
      status: "Active (200 OK)",
      frequency: "Every 30 Minutes",
      lastPing: "20-10-2026 17:55:00 IST",
      latencyMs: 210,
      sslVerified: true,
      pendingNotices: 0,
      verificationBadge: "Verified Official Source"
    },
    {
      id: "portal-nta",
      agency: "National Testing Agency (UGC-NET)",
      domain: "ugcnet.nta.ac.in",
      url: "https://ugcnet.nta.ac.in/public-notices",
      status: "Active (200 OK)",
      frequency: "Every 20 Minutes",
      lastPing: "20-10-2026 18:05:40 IST",
      latencyMs: 165,
      sslVerified: true,
      pendingNotices: 0,
      verificationBadge: "Verified Official Source"
    },
    {
      id: "portal-ibps",
      agency: "Institute of Banking Personnel Selection",
      domain: "ibps.in",
      url: "https://ibps.in/notifications",
      status: "Active (200 OK)",
      frequency: "Every 30 Minutes",
      lastPing: "20-10-2026 17:45:12 IST",
      latencyMs: 175,
      sslVerified: true,
      pendingNotices: 0,
      verificationBadge: "Verified Official Source"
    },
    {
      id: "portal-kea",
      agency: "Karnataka Examinations Authority (KSET / CET)",
      domain: "cetonline.karnataka.gov.in",
      url: "https://cetonline.karnataka.gov.in/kea/",
      status: "Active (200 OK)",
      frequency: "Every 1 Hour",
      lastPing: "20-10-2026 17:30:00 IST",
      latencyMs: 290,
      sslVerified: true,
      pendingNotices: 0,
      verificationBadge: "Verified Official Source"
    },
    {
      id: "portal-rbi",
      agency: "Reserve Bank of India Opportunities",
      domain: "opportunities.rbi.org.in",
      url: "https://opportunities.rbi.org.in/scripts/vacancies.aspx",
      status: "Active (200 OK)",
      frequency: "Every 2 Hours",
      lastPing: "20-10-2026 16:50:22 IST",
      latencyMs: 195,
      sslVerified: true,
      pendingNotices: 0,
      verificationBadge: "Verified Official Source"
    },
    {
      id: "portal-rrb",
      agency: "Railway Recruitment Control Board",
      domain: "rrbapply.gov.in",
      url: "https://rrbapply.gov.in/#/notices",
      status: "Active (200 OK)",
      frequency: "Every 15 Minutes",
      lastPing: "20-10-2026 18:08:15 IST",
      latencyMs: 154,
      sslVerified: true,
      pendingNotices: 0,
      verificationBadge: "Verified Official Source"
    }
  ],

  extractedNotificationsLog: [
    {
      id: "ext-101",
      noticeNumber: "Exam Notice No. 05/2026-CSP",
      agency: "UPSC",
      title: "Civil Services (Preliminary) Examination 2026",
      detectionTime: "14-01-2026 10:04:12 IST",
      rawPdfUrl: "https://upsc.gov.in/",
      extractionStatus: "Verified & Parsed",
      extractedFields: {
        totalVacancies: 1105,
        lastDateToApply: "05-03-2026 18:00 IST",
        prelimsDate: "24-05-2026",
        ageCutoffDate: "01-08-2026",
        payLevel: "Level 10",
        stages: 3,
        examMode: "Offline OMR Written"
      },
      verificationStatus: "Verified Official",
      confidenceScore: "99.4%",
      parserMethod: "NLP LayoutLM + Regex Rule Parser (Demo)"
    },
    {
      id: "ext-102",
      noticeNumber: "F. No. HQ-PPII03(02)/2026",
      agency: "SSC",
      title: "Combined Graduate Level Examination (CGL) 2026",
      detectionTime: "10-02-2026 14:22:05 IST",
      rawPdfUrl: "https://ssc.gov.in/",
      extractionStatus: "Verified & Parsed",
      extractedFields: {
        totalVacancies: 14750,
        lastDateToApply: "15-03-2026 23:00 IST",
        prelimsDate: "12-06-2026",
        ageCutoffDate: "01-08-2026",
        payLevel: "Level 4 to Level 7",
        stages: 2,
        examMode: "Computer Based Test (CBE)"
      },
      verificationStatus: "Verified Official",
      confidenceScore: "98.7%",
      parserMethod: "NLP LayoutLM (Demo)"
    },
    {
      id: "ext-103",
      noticeNumber: "KEA/ED/KSET/2026/01",
      agency: "KEA / KSET",
      title: "Karnataka State Eligibility Test Information Bulletin",
      detectionTime: "15-02-2026 16:45:00 IST",
      rawPdfUrl: "https://cetonline.karnataka.gov.in/kea/",
      extractionStatus: "Verified & Parsed",
      extractedFields: {
        totalVacancies: "Accreditation",
        lastDateToApply: "30-03-2026",
        prelimsDate: "19-07-2026",
        ageCutoffDate: "No Limit",
        payLevel: "Academic Level 10",
        stages: 1,
        examMode: "Pen & Paper OMR"
      },
      verificationStatus: "Verified Official",
      confidenceScore: "97.2%",
      parserMethod: "Optical Form Recognizer (Demo)"
    },
    {
      id: "ext-104",
      noticeNumber: "NTA/UGC-NET/2026/CORR-01",
      agency: "NTA",
      title: "Public Notice: 4-Year B.Tech Students Allowed for JRF & Ph.D.",
      detectionTime: "01-03-2026 11:30:00 IST",
      rawPdfUrl: "https://ugcnet.nta.ac.in/",
      extractionStatus: "Corrigendum Detected",
      extractedFields: {
        ruleAmendment: "NEP 2020 Clause 4.2",
        affectedDiscipline: "B.Tech Computer Science & Allied Engineering (75% minimum marks)",
        effectiveSession: "June 2026 onwards"
      },
      verificationStatus: "Verified Official",
      confidenceScore: "99.8%",
      parserMethod: "Diff Clause Matcher (Demo)"
    }
  ],

  notificationDiffs: [
    {
      id: "diff-001",
      examCode: "UGC-NET-2026",
      agency: "NTA",
      title: "Eligibility Clause Modification: NEP 2020 Undergraduate Inclusion",
      changeDate: "01-03-2026",
      status: "Corrigendum Verified",
      oldText: "Candidates who have secured at least 55% marks in Master's Degree or equivalent examination from universities/institutions recognized by UGC are eligible for this Test.",
      newText: "Candidates who have secured at least 55% marks in Master's Degree OR candidates pursuing a 4-year Bachelor's degree (B.E./B.Tech) who are in their final year with minimum 75% marks are eligible for JRF and Ph.D. admission.",
      impactSummary: "Unlocks eligibility for 2,400+ final year engineering students on the platform without needing a prior Master's degree."
    },
    {
      id: "diff-002",
      examCode: "KPSC-KAS-2026",
      agency: "KPSC",
      title: "Application Deadline Extension Notice (Advt 41 E(1))",
      changeDate: "28-02-2026",
      status: "Deadline Extended",
      oldText: "The last date for submission of online application for Gazetted Probationers 2026 is 28-02-2026 up to 11:59 PM.",
      newText: "The last date for submission of online application for Gazetted Probationers 2026 has been extended up to 10-03-2026 up to 11:59 PM due to server maintenance.",
      impactSummary: "Deadline extended by 10 days. System reminders and countdown timers automatically adjusted."
    }
  ],

  databaseUpdateAuditLog: [
    {
      timestamp: "20-10-2026 17:30:15 IST",
      agent: "Notification Watchdog Agent",
      event: "Sync Exam Date",
      examCode: "ISRO-SC",
      details: "Written exam date updated to 19-04-2026 based on ICRB circular 02:2026.",
      status: "Auto-Updated (Demo)"
    },
    {
      timestamp: "20-10-2026 15:45:00 IST",
      agent: "Eligibility Screener Agent",
      event: "Update Rule Table",
      examCode: "UGC-NET",
      details: "Added rule: 4-Year B.Tech with >=75% eligible for JRF.",
      status: "Auto-Updated (Demo)"
    },
    {
      timestamp: "20-10-2026 11:15:20 IST",
      agent: "Watchdog Monitor Agent",
      event: "New Notice Discovered",
      examCode: "RRB-NTPC",
      details: "CEN 05/2024 Exam City Slip link live on rrbapply.gov.in.",
      status: "Auto-Updated (Demo)"
    }
  ],

  studentAlertsQueue: [
    {
      id: "alert-001",
      targetCategory: "Engineering / B.Tech CSE Aspirants",
      examCode: "ISRO-SC",
      message: "🚨 ISRO ICRB Scientist 'SC' Computer Science exam date announced for 19-04-2026. Hall tickets available 10 days prior.",
      dispatchStatus: "Dispatched to 1,420 students",
      timestamp: "18-02-2026"
    },
    {
      id: "alert-002",
      targetCategory: "Karnataka Domicile Candidates",
      examCode: "KSET-2026",
      message: "📢 Karnataka SET 2026 applications closing on 30-03-2026. Ensure OBC/Category certificate validity.",
      dispatchStatus: "Dispatched to 890 students",
      timestamp: "25-02-2026"
    },
    {
      id: "alert-003",
      targetCategory: "UPSC CSE Bookmarked Candidates",
      examCode: "UPSC-CSE",
      message: "⚠️ UPSC Civil Services 2026 application window closes in 14 days (05-03-2026). Submit fee early to avoid server load.",
      dispatchStatus: "Dispatched to 2,150 students",
      timestamp: "20-02-2026"
    }
  ]
};

/**
 * Default Application Status Records (Module D - Feature 32 & 36)
 */
const DEFAULT_APPLICATION_RECORDS = [
  {
    id: "app-rec-01",
    examId: "isro-scientist-sc-2026",
    examCode: "ISRO-SC",
    examTitle: "ISRO ICRB Scientist/Engineer 'SC' (Computer Science)",
    applicationNumber: "ISRO2026CS88910",
    appliedDate: "12-01-2026",
    examDate: "19-04-2026",
    status: "Applied", // Interested, Preparing, Applied, Admit Card Available, Completed
    centerCity: "Bengaluru, Karnataka",
    venueAddress: "Army Public School, PRTC Campus, Near Trinity Circle, MG Road, Bengaluru - 560008",
    reportingTime: "08:30 AM IST",
    shiftTime: "09:30 AM to 11:30 AM",
    admitCardUrl: "demo_isro_admit_card.pdf",
    admitCardStatus: "Expected 09-04-2026 (10 Days Before Exam)",
    notes: "Revise Operating Systems semaphores & Graph algorithms; carry 2 passport photos and Original Voter ID."
  },
  {
    id: "app-rec-02",
    examId: "ssc-cgl-2026",
    examCode: "SSC-CGL",
    examTitle: "SSC Combined Graduate Level (CGL) 2026",
    applicationNumber: "SSCCGL2026774921",
    appliedDate: "18-02-2026",
    examDate: "12-06-2026",
    status: "Preparing",
    centerCity: "Bengaluru, Karnataka",
    venueAddress: "iON Digital Zone, Whitefield, Bengaluru - 560066",
    reportingTime: "11:30 AM IST",
    shiftTime: "12:30 PM to 01:30 PM",
    admitCardUrl: null,
    admitCardStatus: "City intimation 10 days before; Admit card 4 days before exam",
    notes: "Targeting Assistant Section Officer in MEA; focus daily on Quantitative Arithmetic and Reasoning puzzles."
  },
  {
    id: "app-rec-03",
    examId: "rrb-ntpc-2026",
    examCode: "RRB-NTPC",
    examTitle: "Railway RRB NTPC Graduate Level (Station Master)",
    applicationNumber: "RRB24CEN059918",
    appliedDate: "15-10-2025",
    examDate: "05-04-2026",
    status: "Admit Card Available",
    centerCity: "Mysuru, Karnataka",
    venueAddress: "JSS Science and Technology University Campus, Manasagangothri, Mysuru - 570006",
    reportingTime: "07:45 AM IST",
    shiftTime: "09:00 AM to 10:30 AM",
    admitCardUrl: "demo_rrb_ntpc_admit.pdf",
    admitCardStatus: "Available for Download (City Slip Activated)",
    notes: "Roll No: RRB-MYS-49921; Free Railway Travel Authority attached for OBC category."
  },
  {
    id: "app-rec-04",
    examId: "ugc-net-cs-2026",
    examCode: "UGC-NET",
    examTitle: "UGC-NET / JRF Computer Science (June 2026)",
    applicationNumber: null,
    appliedDate: null,
    examDate: "15-06-2026",
    status: "Interested",
    centerCity: "Bengaluru, Karnataka",
    venueAddress: "To be allocated by NTA",
    reportingTime: "08:00 AM IST",
    shiftTime: "09:00 AM to 12:00 PM (Single Session)",
    admitCardUrl: null,
    admitCardStatus: "Application window opening 20-03-2026",
    notes: "Applying under NEP 2020 4-year B.Tech JRF provision (>75% marks)."
  }
];

/**
 * Exam Pattern Comparison Matrix Data (Module B - Feature 13, 14, 15)
 */
const EXAM_COMPARISON_DATA = {
  // Pre-calculated topic overlaps
  overlapMatrix: {
    "ssc-cgl-2026_ibps-po-2026": {
      overlapPercentage: 84,
      sharedTopics: ["Quantitative Aptitude (Number Systems, Arithmetic)", "Reasoning Ability (Puzzles, Syllogisms)", "English Language Comprehension", "Basic Computer Aptitude"],
      distinctTopicsExamA: ["Advanced Mathematics (Trigonometry, Geometry, Coordinate Geometry)", "Static Indian GK & Science", "General Studies (History, Polity)"],
      distinctTopicsExamB: ["Banking & Financial Awareness", "RBI Monetary Policy", "Economic Terminology", "Descriptive Letter/Essay Writing"]
    },
    "upsc-cse-2026_kpsc-kas-2026": {
      overlapPercentage: 78,
      sharedTopics: ["Indian Constitution & Polity", "Modern Indian History & Freedom Struggle", "Indian Economy & Budget", "World & Indian Geography", "Environment & Ecology", "CSAT Reasoning & Math"],
      distinctTopicsExamA: ["International Relations (IR)", "Detailed Ethics, Integrity & Aptitude (GS-4)", "Optional Subject (2 Papers)"],
      distinctTopicsExamB: ["Karnataka State History & Heritage", "Karnataka Economy & Geography", "Kannada Language Qualifying Paper", "Karnataka Land Reforms & Panchayat Raj"]
    },
    "isro-scientist-sc-2026_gate-psu-2026": {
      overlapPercentage: 92,
      sharedTopics: ["Data Structures & Algorithms", "Theory of Computation & Compiler Design", "Operating Systems & Virtual Memory", "Computer Networks & Security", "Database Management Systems (DBMS)", "Computer Organization & Architecture", "Discrete Mathematics"],
      distinctTopicsExamA: ["Speed Mental Math (ISRO Part-B)", "Digital Signal Processing basics", "Space mission telemetry concepts"],
      distinctTopicsExamB: ["Engineering Mathematics (Calculus, Linear Algebra, Probability)", "General Aptitude"]
    },
    "isro-scientist-sc-2026_nic-scientist-tech-2026": {
      overlapPercentage: 90,
      sharedTopics: ["Core Computer Science (DSA, OS, DBMS, Networks, Architecture)", "Software Engineering & SDLC", "Cybersecurity & Cryptography"],
      distinctTopicsExamA: ["Theory of Computation deep theoretical proofs", "Space flight ground software"],
      distinctTopicsExamB: ["Web Technologies (HTML/CSS/JS/Cloud)", "e-Governance Architectures", "NIC Digital Stack"]
    }
  }
};

/**
 * Photo & Signature Specifications per Commission (Module D - Feature 35)
 */
const COMMISSION_PHOTO_SPECS = {
  upsc: {
    name: "Union Public Service Commission (UPSC)",
    photo: {
      minKb: 20,
      maxKb: 300,
      format: ["image/jpeg", "image/jpg"],
      minWidth: 350,
      maxWidth: 1000,
      minHeight: 350,
      maxHeight: 1000,
      aspectRatio: "1:1 to 3:4",
      notes: "Photograph must not be more than 10 days old from start of application; candidate's name and date on which photo was taken must be clearly printed at bottom."
    },
    signature: {
      minKb: 20,
      maxKb: 300,
      format: ["image/jpeg", "image/jpg"],
      minWidth: 350,
      maxWidth: 1000,
      minHeight: 350,
      maxHeight: 1000,
      notes: "Clear signature in black ink on white paper."
    }
  },
  ssc: {
    name: "Staff Selection Commission (SSC)",
    photo: {
      minKb: 20,
      maxKb: 50,
      format: ["image/jpeg", "image/jpg"],
      widthPx: 140, // 3.5 cm
      heightPx: 175, // 4.5 cm
      aspectRatio: "3.5:4.5",
      notes: "Live webcam capture or 20-50 KB file; without cap or spectacles; frontal view with both ears clearly visible."
    },
    signature: {
      minKb: 10,
      maxKb: 20,
      format: ["image/jpeg", "image/jpg"],
      widthPx: 140, // 4.0 cm
      heightPx: 70, // 2.0 cm
      notes: "Horizontal signature in black/blue ink on white background."
    }
  },
  ibps: {
    name: "Institute of Banking Personnel Selection (IBPS / SBI)",
    photo: {
      minKb: 20,
      maxKb: 50,
      format: ["image/jpeg", "image/jpg"],
      widthPx: 200,
      heightPx: 230,
      notes: "Recent passport photo with light/white background; no red-eye; no tinted glasses."
    },
    signature: {
      minKb: 10,
      maxKb: 20,
      format: ["image/jpeg", "image/jpg"],
      widthPx: 140,
      heightPx: 60,
      notes: "Running handwriting signature. Capital letters NOT allowed."
    }
  },
  nta: {
    name: "National Testing Agency (UGC-NET / NTA)",
    photo: {
      minKb: 10,
      maxKb: 200,
      format: ["image/jpeg", "image/jpg"],
      notes: "80% face coverage against white background without mask."
    },
    signature: {
      minKb: 4,
      maxKb: 30,
      format: ["image/jpeg", "image/jpg"],
      notes: "Clear black ballpoint signature on white sheet."
    }
  }
};

/**
 * Exam-Day Checklist & Instructions (Module D - Feature 37)
 */
const EXAM_DAY_GUIDELINES = {
  mandatoryDocs: [
    { id: "ed-admit", text: "Original Printed Admit Card (with barcode/QR code clearly legible)", required: true },
    { id: "ed-id", text: "Original Government Photo ID Proof (Aadhaar Card with full DOB / Voter ID / Passport / Driving Licence)", required: true },
    { id: "ed-id-copy", text: "One Clear Photocopy of the Government Photo ID Proof", required: true },
    { id: "ed-photos", text: "2 Passport-Sized Photographs identical to the one uploaded during registration", required: true }
  ],
  permittedItems: [
    { id: "ed-pen", text: "Transparent Blue/Black Ballpoint Pens (Gel pens strictly prohibited on OMR)", permitted: true },
    { id: "ed-water", text: "Transparent 500ml Water Bottle (without any paper wrapper)", permitted: true },
    { id: "ed-sanitizer", text: "Small Transparent Hand Sanitizer bottle (50ml)", permitted: true },
    { id: "ed-glasses", text: "Prescription spectacles (Smart glasses with camera strictly banned)", permitted: true }
  ],
  prohibitedItems: [
    "Smartwatches, digital watches, or fitness trackers",
    "Mobile phones, Bluetooth earphones, pagers, or electronic audio devices",
    "Calculators, logarithmic tables, or slide rules (unless specified for GATE)",
    "Bags, wallets, purses, metallic ornaments, or heavy jewelry",
    "Any printed or written study material, chits, or textbooks"
  ],
  gateClosureRules: [
    "Reporting Time is typically 60 to 90 minutes prior to exam commencement.",
    "Gate closure is strictly enforced 30 minutes before exam time (e.g. 08:30 AM for a 09:00 AM shift). No candidate is permitted inside under any circumstances once gates are sealed."
  ]
};
