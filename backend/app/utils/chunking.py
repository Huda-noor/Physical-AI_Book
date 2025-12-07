"""
Semantic chunking utility for markdown content.
Chunks text while respecting heading boundaries and maintaining context.
"""
import re
from typing import List, Tuple
from uuid import uuid4


def count_tokens(text: str) -> int:
    """
    Approximate token count (GPT-style tokenization).
    Rule of thumb: 1 token ≈ 4 characters for English text.

    Args:
        text: Input text

    Returns:
        Approximate token count
    """
    return len(text) // 4


def extract_chapter_metadata(markdown_content: str) -> Tuple[int, str]:
    """
    Extract chapter ID and title from markdown frontmatter.

    Args:
        markdown_content: Full markdown file content

    Returns:
        Tuple of (chapter_id, chapter_title)
    """
    # Extract from frontmatter
    frontmatter_match = re.search(r'---\n(.*?)\n---', markdown_content, re.DOTALL)

    if frontmatter_match:
        frontmatter = frontmatter_match.group(1)

        # Extract id (e.g., "chapter-1-introduction-to-physical-ai")
        id_match = re.search(r'id:\s*chapter-(\d+)-', frontmatter)
        chapter_id = int(id_match.group(1)) if id_match else 1

        # Extract title
        title_match = re.search(r'title:\s*(.+)', frontmatter)
        title = title_match.group(1).strip() if title_match else "Unknown Chapter"

        return chapter_id, title

    return 1, "Unknown Chapter"


def parse_markdown_sections(markdown_content: str) -> List[dict]:
    """
    Parse markdown into sections based on headings.

    Args:
        markdown_content: Full markdown file content

    Returns:
        List of sections with heading, level, and content
    """
    # Remove frontmatter
    content = re.sub(r'^---\n.*?\n---\n', '', markdown_content, flags=re.DOTALL)

    # Split by headings (## or ###)
    sections = []
    current_section = None

    for line in content.split('\n'):
        # Check for heading
        heading_match = re.match(r'^(#{2,3})\s+(.+)$', line)

        if heading_match:
            # Save previous section
            if current_section:
                sections.append(current_section)

            # Start new section
            level = len(heading_match.group(1))  # 2 for ##, 3 for ###
            heading = heading_match.group(2).strip()
            current_section = {
                'level': level,
                'heading': heading,
                'content': ''
            }
        elif current_section:
            current_section['content'] += line + '\n'

    # Add final section
    if current_section:
        sections.append(current_section)

    return sections


def semantic_chunking(
    markdown_content: str,
    max_tokens: int = 512,
    overlap_tokens: int = 50
) -> List[dict]:
    """
    Chunk markdown content with semantic boundaries.

    Strategy:
    1. Parse markdown into sections by headings
    2. Combine sections until token limit is reached
    3. Respect heading boundaries (don't split mid-section)
    4. Add overlap between chunks for context

    Args:
        markdown_content: Full markdown file content
        max_tokens: Maximum tokens per chunk (default 512)
        overlap_tokens: Overlap between chunks (default 50)

    Returns:
        List of chunk dictionaries with metadata
    """
    chapter_id, chapter_title = extract_chapter_metadata(markdown_content)
    sections = parse_markdown_sections(markdown_content)

    chunks = []
    current_chunk_sections = []
    current_chunk_tokens = 0

    for i, section in enumerate(sections):
        section_text = f"## {section['heading']}\n\n{section['content']}"
        section_tokens = count_tokens(section_text)

        # Check if adding this section exceeds limit
        if current_chunk_tokens + section_tokens > max_tokens and current_chunk_sections:
            # Save current chunk
            chunk_text = '\n\n'.join(current_chunk_sections)
            chunks.append({
                'chapter_id': chapter_id,
                'section_id': f"{chapter_id}.{len(chunks) + 1}",
                'section_title': sections[len(chunks)]['heading'] if len(chunks) < len(sections) else chapter_title,
                'content': chunk_text,
                'token_count': current_chunk_tokens,
                'char_count': len(chunk_text)
            })

            # Start new chunk with overlap
            # Include last N tokens from previous chunk
            overlap_text = current_chunk_sections[-1] if current_chunk_sections else ""
            overlap_token_count = count_tokens(overlap_text)

            if overlap_token_count > overlap_tokens:
                # Trim to overlap size
                overlap_chars = (overlap_tokens * 4)
                overlap_text = overlap_text[-overlap_chars:]
                overlap_token_count = overlap_tokens

            current_chunk_sections = [overlap_text] if overlap_text else []
            current_chunk_tokens = overlap_token_count

        # Add section to current chunk
        current_chunk_sections.append(section_text)
        current_chunk_tokens += section_tokens

    # Add final chunk
    if current_chunk_sections:
        chunk_text = '\n\n'.join(current_chunk_sections)
        chunks.append({
            'chapter_id': chapter_id,
            'section_id': f"{chapter_id}.{len(chunks) + 1}",
            'section_title': sections[-1]['heading'] if sections else chapter_title,
            'content': chunk_text,
            'token_count': current_chunk_tokens,
            'char_count': len(chunk_text)
        })

    # Add chunk IDs and indices
    for idx, chunk in enumerate(chunks):
        chunk['chunk_id'] = uuid4()
        chunk['chunk_index'] = idx

    return chunks


def generate_preview_text(content: str, max_length: int = 200) -> str:
    """
    Generate preview text from chunk content.

    Args:
        content: Full chunk content
        max_length: Maximum preview length

    Returns:
        Truncated preview with ellipsis
    """
    # Remove markdown formatting
    clean_text = re.sub(r'#+\s+', '', content)  # Remove headings
    clean_text = re.sub(r'\*\*(.+?)\*\*', r'\1', clean_text)  # Remove bold
    clean_text = re.sub(r'\*(.+?)\*', r'\1', clean_text)  # Remove italic
    clean_text = re.sub(r'`(.+?)`', r'\1', clean_text)  # Remove inline code
    clean_text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', clean_text)  # Remove links
    clean_text = ' '.join(clean_text.split())  # Normalize whitespace

    if len(clean_text) <= max_length:
        return clean_text

    # Truncate at word boundary
    truncated = clean_text[:max_length]
    last_space = truncated.rfind(' ')

    if last_space > max_length * 0.8:
        truncated = truncated[:last_space]

    return truncated.strip() + '...'
