from pydantic import BaseModel

class SourceNode(BaseModel):
    document: str
    page: int
    section: str
    similarity: float
