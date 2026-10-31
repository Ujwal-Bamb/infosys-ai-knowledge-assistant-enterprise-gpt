from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    id: int
    document_id: Optional[str] = None
    title: str
    filename: str
    department: Optional[str] = None
    document_type: Optional[str] = None
    access_scope: str = "all_users"
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)