import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { usePersonalization } from '@site/src/contexts/PersonalizationContext';
import { useAuth } from '@site/src/contexts/AuthContext';

interface PersonalizedContentProps {
  chapterId: number;
  originalContent: string;
}

const PersonalizedContent: React.FC<PersonalizedContentProps> = ({ chapterId, originalContent }) => {
  const { isPersonalized } = usePersonalization();
  const { isAuthenticated } = useAuth();
  const [personalizedMarkdown, setPersonalizedMarkdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPersonalized && isAuthenticated) {
      handlePersonalize();
    } else {
      setPersonalizedMarkdown(null);
    }
  }, [isPersonalized, isAuthenticated, chapterId]);

  const handlePersonalize = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/personalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          chapter_id: chapterId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to personalize content');
      }

      const data = await response.json();
      setPersonalizedMarkdown(data.personalized_markdown);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during personalization');
      console.error('Personalization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="personalization-loading">
        <div className="loading-spinner"></div>
        <p>Personalizing content for your background...</p>
        <style jsx>{`
          .personalization-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 2rem;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px dashed #cbd5e1;
            margin: 1rem 0;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert--danger margin-bottom--md" role="alert">
        <p><strong>Personalization Error:</strong> {error}</p>
        <button className="button button--sm button--secondary" onClick={handlePersonalize}>
          Retry
        </button>
      </div>
    );
  }

  if (isPersonalized && personalizedMarkdown) {
    return (
      <div className="personalized-markdown-content">
        <div className="alert alert--success margin-bottom--md" role="alert">
          ✨ This content has been personalized for your background.
        </div>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {personalizedMarkdown}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="original-markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {originalContent}
      </ReactMarkdown>
    </div>
  );
};

export default PersonalizedContent;
