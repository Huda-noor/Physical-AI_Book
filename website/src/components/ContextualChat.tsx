import React, { useState, useEffect, useRef } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useAuth } from '@site/src/contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ContextualChatProps {
  chapterTitle: string;
  sectionTitle?: string;
  contentContext?: string; // Additional context from the current page
}

const ContextualChatContent: React.FC<ContextualChatProps> = ({ chapterTitle, sectionTitle, contentContext }) => {
  const { user, isAuthenticated } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => {
    return `contextual-${Date.now()}`;
  });

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (showChat && !isAuthenticated) {
      setShowChat(false);
      if (typeof window !== 'undefined') {
        alert('Please sign in to access the AI tutor');
      }
    }
  }, [showChat, isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    if (!isAuthenticated) {
      alert('Please sign in to access the AI tutor');
      return;
    }
    setShowChat(!showChat);
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
      // Prepare context for the RAG API
      const context = {
        chapter: chapterTitle,
        section: sectionTitle,
        content: contentContext,
        userBackground: user?.profile?.softwareBackground,
        userLanguages: user?.profile?.programmingLanguages,
        userExperience: user?.profile?.roboticsExperience,
      };

      // Call the RAG API with context
      const response = await callRAGAPI(inputValue, sessionId, context);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
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

  // Call the RAG API with context
  const callRAGAPI = async (query: string, sessionId: string, context: any): Promise<string> => {
    const response = await fetch('http://localhost:3001/rag/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query, 
        sessionId,
        context
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from RAG API');
    }

    const data = await response.json();
    return data.response;
  };

  if (!isAuthenticated) {
    return (
      <div className="contextual-chat-container">
        <div className="alert alert--info" role="alert">
          Sign in to access the AI tutor for personalized help with this content.
        </div>
      </div>
    );
  }

  return (
    <div className="contextual-chat-container">
      <div className="contextual-chat-header">
        <button
          className="contextual-chat-toggle button button--secondary button--sm"
          onClick={toggleChat}
        >
          {showChat ? 'Hide AI Tutor' : 'Ask AI Tutor'}
        </button>
      </div>

      {showChat && (
        <div className="contextual-chat-content card">
          <div className="card__header">
            <h4>AI Tutor for: {chapterTitle}{sectionTitle ? ` - ${sectionTitle}` : ''}</h4>
          </div>

          <div className="card__body">
            <div className="chat-messages padding--sm">
              {messages.length === 0 ? (
                <div className="welcome-message text--center padding--md">
                  <p>Ask questions about <strong>{chapterTitle}</strong> and I'll help based on your learning profile.</p>
                  {user?.profile && (
                    <p className="text--small padding-top--sm">
                      <strong>Your profile:</strong> {user.profile.softwareBackground} background,
                      {user.profile.programmingLanguages?.length > 0 && ` knows ${user.profile.programmingLanguages.join(', ')}`}
                    </p>
                  )}
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.role === 'user' ? 'user-message' : 'bot-message'} margin-bottom--sm`}
                  >
                    <div className="message-content">
                      {message.content}
                    </div>
                    <div className="message-timestamp text--small text--right">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="message bot-message margin-bottom--sm">
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

            <form onSubmit={handleSubmit} className="chat-input-form padding--sm">
              <div className="form-group">
                <textarea
                  className="form-control"
                  rows={2}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Ask about ${chapterTitle}${sectionTitle ? `: ${sectionTitle}` : ''}...`}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="button button--primary button--sm"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ContextualChat: React.FC<ContextualChatProps> = (props) => {
  return (
    <BrowserOnly fallback={<div>Loading chat...</div>}>
      {() => <ContextualChatContent {...props} />}
    </BrowserOnly>
  );
};

export default ContextualChat;