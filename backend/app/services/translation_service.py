from typing import Dict, Any, List
import logging
import re
from app.services.openai_service import openai_service
from app.config import settings

logger = logging.getLogger(__name__)

class TranslationService:
    def __init__(self):
        self.model = settings.llm_model

    def _protect_code_blocks(self, text: str) -> tuple[str, Dict[str, str]]:
        """Extracts code blocks and replaces them with placeholders to prevent translation."""
        code_blocks = {}
        def replace_func(match):
            placeholder = f"[[CODE_BLOCK_{len(code_blocks)}]]"
            code_blocks[placeholder] = match.group(0)
            return placeholder

        # Protect triple backtick blocks and inline code
        protected_text = re.sub(r'```[\s\S]*?```', replace_func, text)
        protected_text = re.sub(r'`[^`\n]+`', replace_func, protected_text)
        return protected_text, code_blocks

    def _restore_code_blocks(self, text: str, code_blocks: Dict[str, str]) -> str:
        """Restores code blocks from placeholders."""
        for placeholder, original in code_blocks.items():
            text = text.replace(placeholder, original)
        return text

    async def translate_markdown(self, markdown_text: str, target_lang: str) -> str:
        lang_map = {"ur": "Urdu", "de": "German", "fr": "French"}
        language_name = lang_map.get(target_lang, "English")

        if target_lang == "en":
            return markdown_text

        # Protect code blocks
        protected_text, code_blocks = self._protect_code_blocks(markdown_text)

        system_prompt = (
            f"You are an expert technical translator specializing in Robotics and AI. "
            f"Translate the following textbook markdown into {language_name}. "
            f"RULES:\n"
            f"1. Preserve technical terms like 'tensor', 'gradient descent', 'backpropagation', 'ROS' in English if no precise natural equivalent exists.\n"
            f"2. Maintain all Markdown syntax (#, -, *, etc.).\n"
            f"3. DO NOT translate any text inside placeholders like [[CODE_BLOCK_N]].\n"
            f"4. Ensure the tone is educational and professional.\n"
            f"5. If Urdu, use proper RTL structure."
        )

        try:
            response = openai_service.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": protected_text}
                ],
                temperature=0.3,
                max_tokens=4000
            )

            translated_text = response.choices[0].message.content

            # Restore code blocks
            final_text = self._restore_code_blocks(translated_text, code_blocks)
            return final_text
        except Exception as e:
            logger.error(f"Translation failed: {e}")
            raise

translation_service = TranslationService()
