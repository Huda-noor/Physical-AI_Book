"""
Personalization service for adapting chapter content using OpenAI.
"""
import logging
from typing import Dict, Any

from app.services.openai_service import openai_service
from app.config import settings

logger = logging.getLogger(__name__)

class PersonalizationService:
    """Service to generate personalized content for textbook chapters."""

    def __init__(self):
        self.model = settings.llm_model

    def build_system_prompt(self, profile: Dict[str, Any]) -> str:
        """
        Constructs a modular system prompt based on user background.
        """
        software = profile.get("software_experience", {})
        robotics = profile.get("robotics_experience", "none")
        hardware = profile.get("hardware_access", [])
        goals = profile.get("learning_goals", [])

        # 1. Base identity
        prompt = (
            "You are an expert educator specialing in Physical AI and Humanoid Robotics. "
            "Your task is to rewrite the following textbook chapter to be highly personalized "
            "for a student's specific background while preserving technical accuracy and concept coverage.\n\n"
        )

        # 2. Add Software Skill Level instructions
        python_level = software.get("python", "none")
        prompt += f"STUDENT PROFILE:\n- Python Level: {python_level}\n"

        if python_level == "beginner":
            prompt += "- Use analogies and step-by-step code walkthroughs for beginner Python developers.\n"
        elif python_level == "advanced":
            prompt += "- Use precise technical language and mention advanced software engineering patterns (e.g. async, decorators, type hints).\n"

        # 3. Add Robotics instructions
        prompt += f"- Robotics Experience: {robotics}\n"
        if robotics == "simulation_only":
            prompt += "- Emphasize simulation tools (Gazebo, Isaac Sim) in examples.\n"
        elif robotics == "real_hardware":
            prompt += "- Include practical tips for hardware deployment and sensor calibration.\n"

        # 4. Add Hardware context
        prompt += f"- Hardware Access: {', '.join(hardware) if hardware else 'None'}\n"
        if "gpu_nvidia" in hardware or "jetson" in str(hardware).lower():
            prompt += "- Mention CUDA, TensorRT, or Jetson-specific optimizations where relevant.\n"

        # 5. Core Rewrite Rules
        prompt += (
            "\nCORE RULES:\n"
            "1. DO NOT change the title or the chapter structure.\n"
            "2. Preserve all Markdown headings and subheadings exactly.\n"
            "3. DO NOT remove any core concepts or technical definitions.\n"
            "4. Adapt the explanation style, examples, and analogies to match the profile above.\n"
            "5. If there is code, ensure it stays valid and functional, but you may explain it at a level matching the Python proficiency.\n"
            "6. Keep the final output in Markdown format."
        )

        return prompt

    async def personalize_chapter(self, chapter_content: str, profile: Dict[str, Any]) -> str:
        """
        Calls OpenAI to personalize the chapter markdown.
        """
        system_prompt = self.build_system_prompt(profile)

        try:
            response = openai_service.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Please personalize this chapter markdown:\n\n{chapter_content}"}
                ],
                temperature=0.7,
                # Increase max_tokens for chapters, though we might need chunking for very long ones
                max_tokens=4000
            )

            personalized_markdown = response.choices[0].message.content
            logger.info("Successfully generated personalized chapter content.")
            return personalized_markdown

        except Exception as e:
            logger.error(f"Failed to personalize chapter: {e}")
            raise

# Global service instance
personalization_service = PersonalizationService()
