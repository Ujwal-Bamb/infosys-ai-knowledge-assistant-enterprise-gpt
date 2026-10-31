from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field

from backend.services.document_schemas import DocumentResponse


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=1000)
    department: Optional[str] = None
    top_k: int = Field(default=5, ge=1, le=20)


class QueryResponse(BaseModel):
    query_id: Optional[int] = None
    question: str
    answer: str
    sources: list[dict[str, Any]] = []
    has_sufficient_evidence: bool = True


class QueryHistoryItem(BaseModel):
    id: int
    question: str
    answer: str
    department: Optional[str] = None
    sources: list[dict[str, Any]] = []
    has_sufficient_evidence: bool = True
    created_at: datetime


class DashboardStatsResponse(BaseModel):
    total_documents: int
    total_departments: int
    user_recent_queries_count: int
    answered_rate: float
    recent_queries: list[QueryHistoryItem] = []
    recent_documents: list[DocumentResponse] = []