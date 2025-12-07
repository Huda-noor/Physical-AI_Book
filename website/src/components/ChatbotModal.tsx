/**
 * ChatbotModal - Main chatbot interface component
 *
 * Displays chat messages, input field, and handles user interactions.
 */
import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../hooks/useChatbot';

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
}

export default function ChatbotModal({
  isOpen,
  onClose,
  messages,
  isLoading,
  error,
  onSendMessage,
}: ChatbotModalProps): JSX.Element | null {
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chatbot-overlay" onClick={onClose}>
      <div className="chatbot-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="chatbot-modal-header">
          <h3>💬 Textbook Assistant</h3>
          <button
            className="chatbot-close-btn"
            onClick={onClose}
            aria-label="Close chatbot"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.length === 0 && (
            <div className="chatbot-welcome">
              <p>👋 Hi! I'm your Physical AI textbook assistant.</p>
              <p>Ask me anything about the course content!</p>
              <div className="chatbot-suggestions">
                <p><strong>Try asking:</strong></p>
                <ul>
                  <li>"What is Physical AI?"</li>
                  <li>"Explain humanoid robot kinematics"</li>
                  <li>"How does ROS 2 work?"</li>
                  <li>"What are VLA systems?"</li>
                </ul>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chatbot-message chatbot-message-${msg.role}`}
            >
              <div className="chatbot-message-content">
                {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 ? (
                  <>
                    <p>{msg.content}</p>
                    <div className="chatbot-sources">
                      <strong>📚 Sources:</strong>
                      <ul>
                        {msg.sources.map((source, idx) => (
                          <li key={idx}>
                            <a
                              href={`/docs/chapter-${source.chapter_id}-${source.section_id.toLowerCase().replace(/\./g, '-')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Chapter {source.chapter_id} - {source.section_title}
                            </a>
                            <span className="relevance-score">
                              ({Math.round(source.relevance_score * 100)}% match)
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="chatbot-message chatbot-message-assistant">
              <div className="chatbot-message-content">
                <div className="chatbot-loader">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="chatbot-error">
              <strong>⚠️ Error:</strong> {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="chatbot-input-container" onSubmit={handleSubmit}>
          <textarea
            className="chatbot-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about the textbook..."
            rows={2}
            disabled={isLoading}
            aria-label="Chat input"
          />
          <button
            type="submit"
            className="chatbot-send-btn"
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send message"
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </form>
      </div>
    </div>
  );
}
