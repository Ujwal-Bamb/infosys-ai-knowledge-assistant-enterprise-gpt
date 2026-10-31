from typing import Any, Optional
from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=1000)
    department: Optional[str] = None
    top_k: int = Field(default=5, ge=1, le=20)


class QueryResponse(BaseModel):
    question: str
    answer: str
    citations: list[dict[str, Any]] = []