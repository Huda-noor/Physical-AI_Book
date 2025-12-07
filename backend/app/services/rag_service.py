"""
RAG (Retrieval-Augmented Generation) service.
Handles query processing, semantic search, re-ranking, and response generation.
"""
import logging
import time
from typing import List
from uuid import UUID

from app.services.embedding_service import embedding_service
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
        top_k: int = 5
    ) -> tuple[str, List[SourceCitation], int]:
        """
        Process a user query end-to-end.

        Pipeline:
        1. Generate query embedding
        2. Search Qdrant for similar chunks
        3. Retrieve metadata from Neon
        4. Re-rank results
        5. Generate answer with citations

        Args:
            question: User's question
            top_k: Number of results to return

        Returns:
            Tuple of (answer, sources, query_time_ms)
        """
        start_time = time.time()

        try:
            # Step 1: Generate query embedding
            logger.info(f"Processing query: {question}")
            query_embedding = embedding_service.encode_text(question)

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

            # Step 4: Re-rank and create source citations
            sources = []

            for result in search_results[:top_k]:
                chunk_id = UUID(result.id)
                metadata = metadata_map.get(chunk_id)

                if not metadata:
                    logger.warning(f"Metadata not found for chunk {chunk_id}")
                    continue

                source = SourceCitation(
                    chunk_id=chunk_id,
                    chapter_id=metadata['chapter_id'],
                    section_id=metadata['section_id'],
                    section_title=metadata['section_title'],
                    preview_text=metadata['preview_text'],
                    relevance_score=round(result.score, 3)
                )

                sources.append(source)

            # Step 5: Generate answer
            answer = self._generate_answer(question, sources)

            # Calculate query time
            query_time_ms = int((time.time() - start_time) * 1000)

            logger.info(f"Query processed in {query_time_ms}ms, found {len(sources)} sources")

            return answer, sources, query_time_ms

        except Exception as e:
            logger.error(f"Query processing failed: {e}")
            raise

    def _generate_answer(self, question: str, sources: List[SourceCitation]) -> str:
        """
        Generate answer from retrieved sources.

        Note: This is a simple implementation that returns sources.
        In production, you would use an LLM to synthesize an answer.

        Args:
            question: User's question
            sources: Retrieved source citations

        Returns:
            Generated answer
        """
        if not sources:
            return "I couldn't find relevant information to answer your question. Please try rephrasing or asking about a specific topic from the textbook."

        # Simple answer: concatenate top sources
        answer_parts = []

        # Add intro
        answer_parts.append(f"Based on the textbook content, here's what I found:")

        # Add top 3 sources
        for i, source in enumerate(sources[:3], 1):
            chapter_ref = f"Chapter {source.chapter_id}"
            section_ref = f"{source.section_title}"
            answer_parts.append(f"\n{i}. From {chapter_ref} - {section_ref}:\n   {source.preview_text}")

        # Add citation note
        if len(sources) > 3:
            answer_parts.append(f"\n\n(+{len(sources) - 3} more relevant sections found)")

        return '\n'.join(answer_parts)

    def _generate_no_results_response(self, question: str) -> tuple[str, List[SourceCitation], int]:
        """
        Generate response when no results are found.

        Args:
            question: User's question

        Returns:
            Tuple of (answer, empty sources, query_time)
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
