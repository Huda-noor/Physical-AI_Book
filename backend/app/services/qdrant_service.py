"""
Qdrant service client for vector search operations.
Handles connection to Qdrant Cloud and semantic search.
"""
import logging
from typing import List, Tuple
from uuid import UUID

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, ScoredPoint
from qdrant_client.http.exceptions import UnexpectedResponse

from app.config import settings

logger = logging.getLogger(__name__)

COLLECTION_NAME = "textbook_chunks"
VECTOR_SIZE = 384  # all-MiniLM-L6-v2 embedding dimension


class QdrantService:
    """Service for interacting with Qdrant vector database."""

    def __init__(self):
        """Initialize Qdrant client with credentials from settings."""
        self.client = QdrantClient(
            url=settings.qdrant_url,
            api_key=settings.qdrant_api_key,
            timeout=10.0
        )
        self.collection_name = COLLECTION_NAME

    def ensure_collection(self) -> bool:
        """
        Ensure the textbook_chunks collection exists.
        Creates it if missing with proper configuration.

        Returns:
            True if collection exists or was created successfully
        """
        try:
            # Check if collection exists
            collections = self.client.get_collections().collections
            exists = any(c.name == self.collection_name for c in collections)

            if exists:
                logger.info(f"Collection '{self.collection_name}' already exists")
                return True

            # Create collection with configuration from specs/textbook-generation/plan.md
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=VECTOR_SIZE,
                    distance=Distance.COSINE
                ),
                # Optimize for free tier: on-disk payload storage
                optimizers_config={
                    "indexing_threshold": 1000
                },
                hnsw_config={
                    "m": 16,
                    "ef_construct": 100
                }
            )

            logger.info(f"✅ Created collection '{self.collection_name}'")
            return True

        except UnexpectedResponse as e:
            logger.error(f"Qdrant API error: {e}")
            return False
        except Exception as e:
            logger.error(f"Failed to ensure collection: {e}")
            return False

    def upsert_chunks(self, chunks: List[Tuple[UUID, List[float], dict]]) -> bool:
        """
        Insert or update chunk embeddings in Qdrant.

        Args:
            chunks: List of (chunk_id, embedding_vector, payload) tuples

        Returns:
            True if upsert succeeded
        """
        try:
            points = [
                PointStruct(
                    id=str(chunk_id),  # Qdrant uses string IDs
                    vector=embedding,
                    payload=payload
                )
                for chunk_id, embedding, payload in chunks
            ]

            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )

            logger.info(f"✅ Upserted {len(points)} chunks to Qdrant")
            return True

        except Exception as e:
            logger.error(f"Failed to upsert chunks: {e}")
            return False

    def search(
        self,
        query_vector: List[float],
        top_k: int = 5
    ) -> List[ScoredPoint]:
        """
        Semantic search for similar chunks.

        Args:
            query_vector: Query embedding (384-dim)
            top_k: Number of results to return (1-10)

        Returns:
            List of ScoredPoint objects with chunk IDs and scores
        """
        try:
            results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=top_k,
                with_payload=True
            )

            logger.info(f"Search returned {len(results)} results")
            return results

        except UnexpectedResponse as e:
            logger.error(f"Qdrant search failed: {e}")
            return []
        except Exception as e:
            logger.error(f"Search error: {e}")
            return []

    def health_check(self) -> bool:
        """
        Check if Qdrant is reachable and collection exists.

        Returns:
            True if healthy
        """
        try:
            collections = self.client.get_collections()
            collection_exists = any(
                c.name == self.collection_name for c in collections.collections
            )
            return collection_exists
        except Exception as e:
            logger.error(f"Qdrant health check failed: {e}")
            return False


# Global service instance
qdrant_service = QdrantService()
