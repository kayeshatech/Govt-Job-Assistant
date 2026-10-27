from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class RAGQueryRequest(BaseModel):
    query: str
    exam_code: Optional[str] = None
    doc_type: Optional[str] = None


class RAGQueryResponse(BaseModel):
    answer: str
    is_supported_by_evidence: bool
    citations: List[Dict[str, Any]]
    confidence_score: float
    provider: str
    latency_ms: int


class ChatMessageRequest(BaseModel):
    query: str
    exam_code: Optional[str] = None
    conversation_history: Optional[List[Dict[str, str]]] = None


class ChatMessageResponse(BaseModel):
    reply: str
    citations: List[str] = []
    suggested_followups: List[str] = []
    provider: str


class QuizGenerateRequest(BaseModel):
    context_text: str
    exam_code: str = "UGC-NET-PAPER1"
    topic: str = "General Aptitude"
    count: int = 5
    difficulty: str = "MEDIUM"


class FlashcardRequest(BaseModel):
    context_text: str
    topic: str = "General Concepts"
    count: int = 6


class MindMapRequest(BaseModel):
    context_text: str
    topic: str = "Curriculum Overview"


class TestSubmissionRequest(BaseModel):
    answers: Dict[str, int] # {question_id: chosen_option_index}
    time_spent_seconds: int = 1800


class PomodoroLogRequest(BaseModel):
    duration_minutes: int = 25
    topic: str = "General Study"
