from typing import List
from app.models.citation import SourceNode

class RAGEngine:
    async def retrieve(self, query: str, user_id: str) -> List[SourceNode]:
        # PROTOTYPE: Instead of searching, return fake citations 
        # to test your CitationBox component.
        return [
            SourceNode(
                document="Rule-VII-Building-Code.pdf",
                page=12,
                section="Section 704.1: Occupancy Loads",
                similarity=0.92
            ),
            SourceNode(
                document="Architectural-Standards-v2.pdf",
                page=5,
                section="Table 5.2: Minimum Setbacks",
                similarity=0.85
            )
        ]