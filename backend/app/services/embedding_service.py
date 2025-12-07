"""
Embedding service using sentence-transformers.
Handles text-to-vector conversion with all-MiniLM-L6-v2 model.
"""
import logging
import os
from typing import List

from sentence_transformers import SentenceTransformer

from app.config import settings

logger = logging.getLogger(__name__)

MODEL_NAME = settings.model_name
CACHE_DIR = settings.transformers_cache
EMBEDDING_DIM = 384  # all-MiniLM-L6-v2 produces 384-dim embeddings


class EmbeddingService:
    """Service for generating text embeddings."""

    def __init__(self):
        """Initialize embedding model with caching."""
        self.model = None
        self.model_loaded = False

    def load_model(self) -> bool:
        """
        Load the sentence-transformers model.
        Downloads to cache directory if not present.

        Returns:
            True if model loaded successfully
        """
        if self.model_loaded:
            logger.info("Embedding model already loaded")
            return True

        try:
            # Ensure cache directory exists
            os.makedirs(CACHE_DIR, exist_ok=True)

            logger.info(f"Loading model: {MODEL_NAME}")
            logger.info(f"Cache directory: {CACHE_DIR}")

            # Load model with CPU-only support (free tier compatible)
            self.model = SentenceTransformer(
                MODEL_NAME,
                cache_folder=CACHE_DIR,
                device="cpu"  # No GPU required
            )

            self.model_loaded = True
            logger.info(f"✅ Model loaded successfully (dim={EMBEDDING_DIM})")
            return True

        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            self.model_loaded = False
            return False

    def encode_text(self, text: str) -> List[float]:
        """
        Convert text to embedding vector.

        Args:
            text: Input text (question or chunk)

        Returns:
            384-dim embedding vector

        Raises:
            RuntimeError: If model not loaded
        """
        if not self.model_loaded:
            raise RuntimeError("Embedding model not loaded. Call load_model() first.")

        try:
            # Generate embedding (returns numpy array)
            embedding = self.model.encode(
                text,
                convert_to_numpy=True,
                normalize_embeddings=True  # L2 normalization for cosine similarity
            )

            # Convert to list for JSON serialization
            return embedding.tolist()

        except Exception as e:
            logger.error(f"Failed to encode text: {e}")
            raise

    def encode_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Batch encode multiple texts for efficiency.

        Args:
            texts: List of input texts

        Returns:
            List of 384-dim embedding vectors

        Raises:
            RuntimeError: If model not loaded
        """
        if not self.model_loaded:
            raise RuntimeError("Embedding model not loaded. Call load_model() first.")

        try:
            # Batch encoding is much faster than sequential
            embeddings = self.model.encode(
                texts,
                convert_to_numpy=True,
                normalize_embeddings=True,
                batch_size=32,  # Process 32 texts at a time
                show_progress_bar=len(texts) > 50  # Show progress for large batches
            )

            # Convert to list of lists
            return [emb.tolist() for emb in embeddings]

        except Exception as e:
            logger.error(f"Failed to batch encode texts: {e}")
            raise

    def health_check(self) -> bool:
        """
        Check if embedding model is loaded and functional.

        Returns:
            True if healthy
        """
        if not self.model_loaded:
            return False

        try:
            # Test encoding
            test_embedding = self.encode_text("test")
            return len(test_embedding) == EMBEDDING_DIM

        except Exception as e:
            logger.error(f"Embedding health check failed: {e}")
            return False


# Global service instance
embedding_service = EmbeddingService()
