def test_list_exams_pagination(client):
    """Exams list must return structured pagination metadata."""
    response = client.get("/api/v1/exams?page=1&limit=3")
    assert response.status_code == 200
    res_json = response.json()
    assert "items" in res_json
    assert "pagination" in res_json
    assert len(res_json["items"]) <= 3
    assert res_json["pagination"]["page"] == 1
    assert res_json["pagination"]["limit"] == 3
    assert res_json["pagination"]["total_records"] >= 5

def test_search_exams(client):
    """Search query matches title, code, or posts."""
    response = client.get("/api/v1/exams?q=UPSC")
    assert response.status_code == 200
    items = response.json()["items"]
    assert len(items) >= 1
    assert any("UPSC" in item["code"] for item in items)

def test_filter_by_level(client):
    """Filter by State vs Central level."""
    response = client.get("/api/v1/exams?level=State")
    assert response.status_code == 200
    items = response.json()["items"]
    assert len(items) >= 1
    assert all(item["level"] == "State" for item in items)

def test_get_exam_detail(client):
    """Detailed view provides stages, syllabus overview, and pay scales."""
    response = client.get("/api/v1/exams/upsc-cse-2026")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["code"] == "UPSC-CSE"
    assert data["vacancies"] == 1105
    assert len(data["stages"]) >= 2
    assert "prelims" in data["syllabus_overview"]
    assert data["pay_level"] == "Level 10"

def test_syllabus_overlap_analysis(client):
    """Syllabus overlap endpoint computes shared subjects and score."""
    response = client.get("/api/v1/exams/upsc-cse-2026/overlap/ssc-cgl-2026")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["exam_code_1"] == "UPSC-CSE"
    assert data["exam_code_2"] == "SSC-CGL"
    assert data["similarity_score"] >= 0
    assert isinstance(data["shared_subject_areas"], list)

def test_nonexistent_exam_raises_404(client):
    """Unknown exam slug must return 404 Not Found."""
    response = client.get("/api/v1/exams/non-existent-exam-xyz")
    assert response.status_code == 404
