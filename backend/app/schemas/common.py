from typing import Generic, TypeVar, Optional, List
from pydantic import BaseModel

T = TypeVar("T")

class PaginationMetadata(BaseModel):
    page: int
    limit: int
    total_records: int
    total_pages: int
    has_next: bool
    has_previous: bool

class StandardApiResponse(BaseModel, Generic[T]):
    success: bool = True
    message: Optional[str] = None
    data: T
    is_sample_data: bool = False

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    pagination: PaginationMetadata
    is_sample_data: bool = False
