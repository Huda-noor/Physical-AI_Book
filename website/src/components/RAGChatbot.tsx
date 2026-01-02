import React, { useState, useEffect, useRef } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatHistory {
  [sessionId: string]: Message[];
}

const RAGChatbotContent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>(() => {
    // Generate a unique session ID or retrieve from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chatSessionId') || Date.now().toString();
    }
    return Date.now().toString();
  });

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Detect text selection on the page
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || '';
      if (text && text.length > 10) {
        setSelectedText(text);
      } else if (text.length === 0) {
        setSelectedText('');
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  // Load chat history from localStorage when component mounts
  useEffect(() => {
    if (typeof window === 'undefined') return; // Only run on client

    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      const history: ChatHistory = JSON.parse(savedHistory);
      setMessages(history[sessionId] || []);
    }
  }, [sessionId]);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    const history: ChatHistory = JSON.parse(localStorage.getItem('chatHistory') || '{}');
    history[sessionId] = messages;
    localStorage.setItem('chatHistory', JSON.stringify(history));
  }, [messages, sessionId]);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call the RAG API (with selected text if available)
      const response = await callRAGAPI(inputValue, sessionId, selectedText);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      // Clear selected text after use
      setSelectedText('');
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error processing your request.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Call the RAG API
  const callRAGAPI = async (query: string, sessionId: string, selectedText?: string): Promise<string> => {
    // Use backend API URL from environment or default
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

    const response = await fetch(`${apiUrl}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: query,
        top_k: 5,
        selected_text: selectedText || null
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from RAG API');
    }

    const data = await response.json();
    // Return the answer with sources
    let responseText = data.answer;

    if (data.sources && data.sources.length > 0) {
      responseText += '\n\n**Sources:**\n';
      data.sources.forEach((source: any, idx: number) => {
        responseText += `${idx + 1}. Chapter ${source.chapter_id}, ${source.section_title} (relevance: ${(source.relevance_score * 100).toFixed(1)}%)\n`;
      });
    }

    return responseText;
  };

  const handleClearChat = () => {
    setMessages([]);
    // Also clear from localStorage
    const history: ChatHistory = JSON.parse(localStorage.getItem('chatHistory') || '{}');
    delete history[sessionId];
    localStorage.setItem('chatHistory', JSON.stringify(history));
  };

  return (
    <div className="rag-chatbot-container">
      <div className="chat-header">
        <h3>AI Tutor</h3>
        <button onClick={handleClearChat} className="clear-chat-button">
          Clear Chat
        </button>
      </div>

      {selectedText && (
        <div className="selected-text-indicator">
          <span className="indicator-icon">📝</span>
          <span className="indicator-text">
            Text selected ({selectedText.length} chars) - Your question will be answered based on this selection
          </span>
          <button onClick={() => setSelectedText('')} className="clear-selection-button">
            ✕
          </button>
        </div>
      )}

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <p>Hello! I'm your AI tutor for Physical AI & Humanoid Robotics.</p>
            <p>Ask me anything about the course content, and I'll help you learn using the textbook knowledge.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.role === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-content">
                {message.content}
              </div>
              <div className="message-timestamp">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message bot-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about Physical AI, Robotics, ROS, etc..."
          disabled={isLoading}
          className="chat-input"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="send-button"
        >
          Send
        </button>
      </form>
    </div>
  );
};

const RAGChatbot: React.FC = () => {
  return (
    <BrowserOnly fallback={<div>Loading chatbot...</div>}>
      {() => <RAGChatbotContent />}
    </BrowserOnly>
  );
};

export default RAGChatbot;