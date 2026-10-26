from app.schemas.eligibility import EligibilityStatusEnum

def test_eligible_candidate_meets_criteria(client):
    """Candidate meeting all criteria returns MEETS_CRITERIA."""
    payload = {
        "date_of_birth": "2001-08-15",
        "category": "General / UR",
        "qualification": "Bachelor of Engineering / B.Tech",
        "percentage": 75.0,
        "major_stream": "Computer Science & Engineering",
        "domicile_state": "Karnataka",
        "is_pwd": False,
    }
    response = client.post("/api/v1/eligibility/check/upsc-cse-2026", json=payload)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["is_eligible"] is True
    assert data["overall_status"] == EligibilityStatusEnum.MEETS_CRITERIA.value
    assert data["eligibility_score_percentage"] == 100

def test_age_boundary_over_age_general(client):
    """General category candidate exceeding 32 years fails UPSC CSE age criteria."""
    payload = {
        "date_of_birth": "1991-05-10",  # ~35 years old on 2026-08-01
        "category": "General / UR",
        "qualification": "Bachelor's Degree",
        "percentage": 65.0,
        "major_stream": "Commerce",
        "domicile_state": "Delhi (NCT)",
    }
    response = client.post("/api/v1/eligibility/check/upsc-cse-2026", json=payload)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["is_eligible"] is False
    assert data["overall_status"] == EligibilityStatusEnum.DOES_NOT_MEET.value
    
    age_check = next(c for c in data["checks"] if "Age" in c["criterion_name"])
    assert age_check["passed"] is False
    assert "exceeds upper limit" in age_check["reason"].lower()

def test_community_age_relaxation_obc(client):
    """Candidate at 34 years old fails General, but passes with OBC-NCL relaxation (32 + 3 = 35)."""
    # 1. As General -> Fails
    gen_payload = {
        "date_of_birth": "1992-06-15",  # 34 years old on 2026-08-01
        "category": "General / UR",
        "qualification": "Bachelor's Degree",
        "percentage": 65.0,
        "major_stream": "Arts",
    }
    res_gen = client.post("/api/v1/eligibility/check/upsc-cse-2026", json=gen_payload).json()["data"]
    assert res_gen["is_eligible"] is False

    # 2. As OBC-NCL -> Passes age condition
    obc_payload = {**gen_payload, "category": "OBC-NCL"}
    res_obc = client.post("/api/v1/eligibility/check/upsc-cse-2026", json=obc_payload).json()["data"]
    assert res_obc["is_eligible"] is True
    assert "OBC-NCL" in res_obc["age_relaxation_applied"]

def test_qualification_degree_level_mismatch(client):
    """Bachelor degree candidate applying for KSET/UGC-NET (requires Master's) fails."""
    payload = {
        "date_of_birth": "2000-01-01",
        "category": "General / UR",
        "qualification": "Bachelor of Engineering / B.Tech",
        "percentage": 70.0,
        "major_stream": "Computer Science",
    }
    response = client.post("/api/v1/eligibility/check/kset-ugc-net-2026", json=payload)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["is_eligible"] is False
    qual_check = next(c for c in data["checks"] if "Qualification" in c["criterion_name"])
    assert qual_check["passed"] is False
    assert "does not satisfy minimum requirement" in qual_check["reason"].lower()

def test_technical_stream_mismatch(client):
    """Arts graduate applying for ISRO Scientist SC (requires technical engineering) fails stream check."""
    payload = {
        "date_of_birth": "2002-03-15",  # 24 years old
        "category": "General / UR",
        "qualification": "Bachelor's Degree",
        "percentage": 75.0,
        "major_stream": "History & Political Science",
    }
    response = client.post("/api/v1/eligibility/check/isro-scientist-sc-2026", json=payload)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["is_eligible"] is False
    qual_check = next(c for c in data["checks"] if "Qualification" in c["criterion_name"])
    assert qual_check["passed"] is False
    assert "not among required disciplines" in qual_check["reason"].lower()

def test_percentage_cutoff_mismatch(client):
    """Candidate with 58% applying for ISRO (requires 65% aggregate) fails percentage check."""
    payload = {
        "date_of_birth": "2002-03-15",
        "category": "General / UR",
        "qualification": "Bachelor of Engineering / B.Tech",
        "percentage": 58.0,
        "major_stream": "Computer Science & Engineering",
    }
    response = client.post("/api/v1/eligibility/check/isro-scientist-sc-2026", json=payload)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["is_eligible"] is False
    pct_check = next(c for c in data["checks"] if "Percentage" in c["criterion_name"])
    assert pct_check["passed"] is False
    assert "below the minimum mandatory cut-off" in pct_check["reason"].lower()

def test_missing_criteria_yields_insufficient_data(client):
    """Omission of candidate age and DOB yields INSUFFICIENT_DATA status."""
    payload = {
        "category": "General / UR",
        "qualification": "Bachelor of Engineering / B.Tech",
        "percentage": 70.0,
        "major_stream": "Computer Science",
    }
    response = client.post("/api/v1/eligibility/check/upsc-cse-2026", json=payload)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["is_eligible"] is False
    assert data["overall_status"] == EligibilityStatusEnum.INSUFFICIENT_DATA.value
