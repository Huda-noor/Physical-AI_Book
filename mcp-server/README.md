# Physical AI Textbook MCP Server

An MCP (Model Context Protocol) server that provides AI assistants with access to the Physical AI & Humanoid Robotics textbook content.

## What is MCP?

MCP (Model Context Protocol) is a protocol that allows AI assistants like Claude to interact with external tools and data sources. This server makes your textbook searchable by AI assistants!

## Features

- **Search Textbook**: Search across all chapters for specific topics
- **Get Chapter**: Retrieve full chapter content
- **List Chapters**: See all available chapters
- **Get Section**: Get specific sections by ID

## Installation

```bash
cd mcp-server
npm install
```

## Usage

### Option 1: Use with Claude Desktop

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "physical-ai-textbook": {
      "command": "node",
      "args": [
        "/absolute/path/to/my-book/mcp-server/index.js"
      ]
    }
  }
}
```

**Location of config file:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### Option 2: Test Locally

```bash
npm start
```

## Available Tools

### 1. search_textbook
Search the textbook for specific topics.

**Input:**
```json
{
  "query": "ROS 2"
}
```

**Output:**
```json
{
  "query": "ros 2",
  "results_count": 3,
  "results": [
    {
      "chapter_id": 3,
      "chapter_title": "ROS 2 Fundamentals",
      "section_id": "3.1",
      "section_title": "ROS 2 Architecture",
      "content": "..."
    }
  ]
}
```

### 2. list_chapters
List all available chapters.

**Output:**
```json
{
  "chapters": [
    {
      "id": 1,
      "title": "Introduction to Physical AI",
      "sections_count": 3
    },
    ...
  ]
}
```

### 3. get_chapter
Get full content of a specific chapter.

**Input:**
```json
{
  "chapter_id": 1
}
```

### 4. get_section
Get a specific section.

**Input:**
```json
{
  "chapter_id": 3,
  "section_id": "3.1"
}
```

## Example Queries with Claude

Once configured in Claude Desktop, you can ask:

- "Search the Physical AI textbook for information about ROS 2"
- "What does chapter 5 cover?"
- "Get me section 3.2 from the textbook"
- "List all chapters in the Physical AI book"

## Development

To add more content, edit the `TEXTBOOK_CONTENT` object in `index.js`.

## Textbook Chapters

1. Introduction to Physical AI
2. Basics of Humanoid Robotics
3. ROS 2 Fundamentals
4. Digital Twin Simulation
5. Vision-Language-Action Systems
6. Capstone: Simple AI-Robot Pipeline

## License

MIT
