from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user, get_optional_current_user
from app.core.security import AuthenticatedUser
from app.models.student import StudentProfile
from app.schemas.prep import (
    RAGQueryRequest,
    RAGQueryResponse,
    ChatMessageRequest,
    ChatMessageResponse,
    QuizGenerateRequest,
    FlashcardRequest,
    MindMapRequest,
)
from app.services.rag_engine import RAGEngine
from app.services.question_generator import QuestionGeneratorService
from app.services.llm_provider import get_llm_provider, benchmark_model_against_recruitment_corpus

router = APIRouter()

@router.post("/chat", response_model=ChatMessageResponse)
def ai_chat_guidance(
    req: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_current_user),
):
    """
    Interactive AI guidance and doubt assistant for Indian government competitive exams.
    Combines RAG context with LLM synthesis.
    """
    rag = RAGEngine(db)
    rag_result = rag.ask_rag_query(req.query, exam_code=req.exam_code)

    reply_text = rag_result["answer"]
    citations = [f"{c['document_title']} (Page {c['page_number']})" for c in rag_result.get("citations", [])]

    suggested = [
        "What is the statutory age limit and relaxation for my category?",
        "Compare syllabus overlap between SSC CGL and IBPS PO.",
        "How is KSET Paper 1 Teaching Aptitude structured?",
    ]

    return ChatMessageResponse(
        reply=reply_text,
        citations=citations,
        suggested_followups=suggested,
        provider=rag_result.get("provider", "govexa_ai"),
    )


@router.post("/rag/query", response_model=RAGQueryResponse)
def query_rag_knowledge_base(
    req: RAGQueryRequest,
    db: Session = Depends(get_db),
):
    """
    Search official recruitment gazettes and syllabi with strict citation referencing.
    Guarantees state of ignorance when facts are not supported by retrieved evidence.
    """
    rag = RAGEngine(db)
    res = rag.ask_rag_query(req.query, exam_code=req.exam_code, doc_type=req.doc_type)
    return RAGQueryResponse(
        answer=res["answer"],
        is_supported_by_evidence=res["is_supported_by_evidence"],
        citations=res.get("citations", []),
        confidence_score=res.get("confidence_score", 0.9),
        provider=res.get("provider", "govexa_rag_engine"),
        latency_ms=res.get("latency_ms", 120),
    )


@router.post("/tools/quiz-generate")
def generate_quiz_from_text(
    req: QuizGenerateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[AuthenticatedUser] = Depends(get_optional_current_user),
):
    """Generate objective multiple-choice practice questions from official text."""
    svc = QuestionGeneratorService(db)
    questions = svc.generate_quiz_from_document(
        document_text=req.context_text,
        exam_code=req.exam_code,
        topic=req.topic,
        count=req.count,
        difficulty=req.difficulty,
        save_to_db=True,
    )
    return {"success": True, "count": len(questions), "questions": questions}


@router.post("/tools/flashcards")
def generate_flashcards(
    req: FlashcardRequest,
    db: Session = Depends(get_db),
):
    """Generate revision flashcard deck from document text."""
    svc = QuestionGeneratorService(db)
    cards = svc.generate_flashcards(
        text=req.context_text,
        topic=req.topic,
        count=req.count,
    )
    return {"success": True, "cards": cards}


@router.post("/tools/mindmap")
def generate_mindmap_tree(
    req: MindMapRequest,
    db: Session = Depends(get_db),
):
    """Generate hierarchical concept node tree for mind mapping."""
    svc = QuestionGeneratorService(db)
    tree = svc.generate_mind_map(
        text=req.context_text,
        topic=req.topic,
    )
    return {"success": True, "tree": tree}


@router.get("/benchmark")
def benchmark_active_llm():
    """
    Benchmark the active AI model against fixed public recruitment documents.
    Measures factual accuracy, schema validity, latency, and token efficiency.
    """
    results = benchmark_model_against_recruitment_corpus()
    return {"success": True, "benchmark": results}
