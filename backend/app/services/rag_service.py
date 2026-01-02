"""
RAG (Retrieval-Augmented Generation) service.
Handles query processing, semantic search, re-ranking, and response generation.
"""
import logging
import time
from typing import List, Optional, Dict
from uuid import UUID

from app.services.openai_service import openai_service
from app.services.qdrant_service import qdrant_service
from app.services.neon_service import neon_service
from app.schemas import SourceCitation

logger = logging.getLogger(__name__)


class RAGService:
    """Service for RAG query processing."""

    def __init__(self):
        """Initialize RAG service."""
        pass

    def process_query(
        self,
        question: str,
        top_k: int = 5,
        selected_text: Optional[str] = None,
        user_profile: Optional[Dict] = None
    ) -> tuple[str, List[SourceCitation], int]:
        """
        Process a user query end-to-end with optional personalization.

        Pipeline:
        1. Generate query embedding
        2. Search Qdrant for similar chunks (or use selected text)
        3. Retrieve metadata from Neon
        4. Re-rank results
        5. Generate answer with OpenAI GPT-4o-mini
        """
        start_time = time.time()

        try:
            # Handle selected text mode (no vector search needed)
            if selected_text:
                logger.info("Using selected text mode")
                answer = openai_service.generate_answer(
                    question=question,
                    context_chunks=[],
                    selected_text=selected_text,
                    user_profile=user_profile
                )
                query_time_ms = int((time.time() - start_time) * 1000)
                return answer, [], query_time_ms

            # Step 1: Generate query embedding
            logger.info(f"Processing query: {question}")
            query_embedding = openai_service.get_embedding(question)

            # Step 2: Semantic search in Qdrant
            logger.info(f"Searching Qdrant for top {top_k} results")
            search_results = qdrant_service.search(
                query_vector=query_embedding,
                top_k=top_k * 2  # Get more for re-ranking
            )

            if not search_results:
                logger.warning("No results found in Qdrant")
                return self._generate_no_results_response(question)

            # Step 3: Retrieve metadata from Neon
            chunk_ids = [UUID(result.id) for result in search_results]
            logger.info(f"Retrieving metadata for {len(chunk_ids)} chunks")
            metadata_records = neon_service.get_chunks_by_ids(chunk_ids)

            # Create mapping: chunk_id -> metadata
            metadata_map = {
                record['chunk_id']: record
                for record in metadata_records
            }

            # Step 4: Prepare context chunks and source citations
            sources = []
            context_chunks = []

            for result in search_results[:top_k]:
                chunk_id = UUID(result.id)
                metadata = metadata_map.get(chunk_id)

                if not metadata:
                    logger.warning(f"Metadata not found for chunk {chunk_id}")
                    continue

                # Create source citation
                source = SourceCitation(
                    chunk_id=chunk_id,
                    chapter_id=metadata['chapter_id'],
                    section_id=metadata['section_id'],
                    section_title=metadata['section_title'],
                    preview_text=metadata['preview_text'],
                    relevance_score=round(result.score, 3)
                )
                sources.append(source)

                # Prepare context for LLM
                context_chunks.append({
                    'text': metadata.get('full_text', metadata['preview_text']),
                    'chapter_id': metadata['chapter_id'],
                    'section_title': metadata['section_title'],
                    'preview_text': metadata['preview_text']
                })

            # Step 5: Generate answer with OpenAI
            answer = openai_service.generate_answer(
                question=question,
                context_chunks=context_chunks,
                user_profile=user_profile
            )

            # Calculate query time
            query_time_ms = int((time.time() - start_time) * 1000)

            logger.info(f"Query processed in {query_time_ms}ms, found {len(sources)} sources")

            return answer, sources, query_time_ms

        except Exception as e:
            logger.error(f"Query processing failed: {e}")
            raise

    def _generate_no_results_response(self, question: str) -> tuple[str, List[SourceCitation], int]:
        """
        Generate response when no results are found.
        """
        answer = (
            "I couldn't find relevant information in the textbook for that question. "
            "Try asking about:\n"
            "- Physical AI fundamentals\n"
            "- Humanoid robot mechanics\n"
            "- ROS 2 programming\n"
            "- Robot simulation\n"
            "- Vision-Language-Action models\n"
            "- AI-robot integration"
        )

        return answer, [], 0


# Global service instance
rag_service = RAGService()
