"""
OpenAI service for embeddings and chat completion.
Handles text-to-vector conversion using text-embedding-ada-002
and answer generation using GPT-4o-mini.
"""
import logging
from typing import List, Dict, Any
from openai import OpenAI

from app.config import settings

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = settings.embedding_model
LLM_MODEL = settings.llm_model
EMBEDDING_DIM = 1536  # text-embedding-ada-002 produces 1536-dim embeddings


class OpenAIService:
    """Service for OpenAI embeddings and chat completion."""

    def __init__(self):
        """Initialize OpenAI client."""
        self.client = OpenAI(api_key=settings.openai_api_key)
        logger.info(f"OpenAI client initialized with model: {LLM_MODEL}")

    def get_embedding(self, text: str) -> List[float]:
        """
        Convert text to embedding vector using OpenAI.

        Args:
            text: Input text (question or chunk)

        Returns:
            1536-dim embedding vector

        Raises:
            Exception: If API call fails
        """
        try:
            # Clean and truncate text if too long
            text = text.replace("\n", " ").strip()

            response = self.client.embeddings.create(
                input=text,
                model=EMBEDDING_MODEL
            )

            embedding = response.data[0].embedding
            logger.debug(f"Generated embedding of dim {len(embedding)}")
            return embedding

        except Exception as e:
            logger.error(f"Failed to get embedding: {e}")
            raise

    def get_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Batch encode multiple texts for efficiency.

        Args:
            texts: List of input texts

        Returns:
            List of 1536-dim embedding vectors

        Raises:
            Exception: If API call fails
        """
        try:
            # Clean texts
            cleaned_texts = [text.replace("\n", " ").strip() for text in texts]

            response = self.client.embeddings.create(
                input=cleaned_texts,
                model=EMBEDDING_MODEL
            )

            embeddings = [item.embedding for item in response.data]
            logger.info(f"Generated {len(embeddings)} embeddings")
            return embeddings

        except Exception as e:
            logger.error(f"Failed to batch encode texts: {e}")
            raise

    def generate_answer(
        self,
        question: str,
        context_chunks: List[Dict[str, Any]],
        selected_text: str | None = None,
        user_profile: Dict[str, Any] | None = None
    ) -> str:
        """
        Generate answer using GPT-4o-mini with retrieved context and optional personalization.
        """
        try:
            # Build context from chunks
            if selected_text:
                context = f"Selected Text:\n{selected_text}\n\n"
            else:
                context = "Relevant Context:\n\n"
                for i, chunk in enumerate(context_chunks, 1):
                    text = chunk.get('text', chunk.get('preview_text', ''))
                    chapter = chunk.get('chapter_id', 'N/A')
                    section = chunk.get('section_title', 'N/A')
                    context += f"[{i}] Chapter {chapter}, Section: {section}\n{text}\n\n"

            # Personalize system prompt if profile provided
            personalization_instruction = ""
            if user_profile:
                exp = user_profile.get("software_experience", {})
                python_lvl = exp.get("python", "none")
                robotics = user_profile.get("robotics_experience", "none")
                hw = user_profile.get("hardware_access", [])

                personalization_instruction = (
                    f"\nSTUDENT BACKGROUND:\n"
                    f"- Python Proficiency: {python_lvl}\n"
                    f"- Robotics Background: {robotics}\n"
                    f"- Hardware Access: {', '.join(hw) if hw else 'None'}\n"
                    "\nADAPTATION RULES:\n"
                    "1. Tailor the explanation depth to the student's background.\n"
                    "2. Use analogies from their experience (e.g., software engineering patterns for advanced coders).\n"
                    "3. Suggest practical applications based on their available hardware.\n"
                )

            # Create system prompt
            system_prompt = (
                "You are an expert AI assistant for a Physical AI and Humanoid Robotics textbook. "
                "Your role is to answer questions based ONLY on the provided context from the textbook.\n"
                f"{personalization_instruction}\n"
                "Guidelines:\n"
                "- Provide clear, accurate, and educational answers\n"
                "- Reference specific chapters/sections when relevant\n"
                "- If the context doesn't contain enough information, say so\n"
                "- Use technical terms appropriately for the student's level\n"
                "- Be concise but thorough\n"
            )

            # Create user message
            user_message = f"{context}\nQuestion: {question}\n\nAnswer the question based on the context above."

            # Call GPT-4o-mini
            response = self.client.chat.completions.create(
                model=LLM_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.7,
                max_tokens=800
            )

            answer = response.choices[0].message.content
            logger.info("Generated answer successfully")
            return answer

        except Exception as e:
            logger.error(f"Failed to generate answer: {e}")
            raise

    def health_check(self) -> bool:
        """
        Check if OpenAI API is accessible.

        Returns:
            True if healthy
        """
        try:
            # Test embedding with simple text
            test_embedding = self.get_embedding("test")
            return len(test_embedding) == EMBEDDING_DIM

        except Exception as e:
            logger.error(f"OpenAI health check failed: {e}")
            return False


# Global service instance
openai_service = OpenAIService()
