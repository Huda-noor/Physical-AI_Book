import React, { useState } from 'react';
import { useAuth } from '@site/src/contexts/AuthContext';

interface ContextualHelpProps {
  chapterTitle: string;
  sectionTitle?: string;
}

const ContextualHelp: React.FC<ContextualHelpProps> = ({ chapterTitle, sectionTitle }) => {
  const { user, isAuthenticated } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');

  const toggleChat = () => {
    if (!isAuthenticated) {
      alert('Please sign in to access the AI tutor');
      return;
    }
    setShowChat(!showChat);
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // In a real implementation, this would send the message to the RAG API
      // For now, we'll just log it and clear the input
      console.log(`Asking about: ${message} in chapter: ${chapterTitle}${sectionTitle ? `, section: ${sectionTitle}` : ''}`);
      setMessage('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="contextual-help-container">
        <div className="alert alert--info" role="alert">
          Sign in to access the AI tutor for personalized help with this content.
        </div>
      </div>
    );
  }

  return (
    <div className="contextual-help-container">
      <div className="contextual-help-header">
        <button 
          className="contextual-help-toggle button button--secondary button--sm"
          onClick={toggleChat}
        >
          {showChat ? 'Hide AI Tutor' : 'Ask AI Tutor'}
        </button>
      </div>
      
      {showChat && (
        <div className="contextual-help-content">
          <div className="alert alert--success margin-bottom--md" role="alert">
            <p><strong>Context:</strong> {chapterTitle}{sectionTitle ? ` - ${sectionTitle}` : ''}</p>
            <p><strong>Learning Profile:</strong> {user?.profile?.softwareBackground || 'Not specified'}</p>
          </div>
          
          <form onSubmit={handleAskQuestion} className="margin-bottom--md">
            <div className="form-group">
              <textarea
                className="form-control"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Ask about ${chapterTitle}${sectionTitle ? `: ${sectionTitle}` : ''}...`}
              />
            </div>
            <button 
              type="submit" 
              className="button button--primary button--sm"
              disabled={!message.trim()}
            >
              Ask Question
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ContextualHelp;