import React, { useState, useEffect } from 'react';
import { useAuth } from '@site/src/contexts/AuthContext';

interface PersonalizationProps {
  chapterTitle: string;
  content: string;
  onContentChange: (content: string) => void;
}

const Personalization: React.FC<PersonalizationProps> = ({ chapterTitle, content, onContentChange }) => {
  const { user, isAuthenticated } = useAuth();
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState(content);

  useEffect(() => {
    if (!isAuthenticated || !user?.profile) {
      setIsPersonalized(false);
      onContentChange(content);
      return;
    }

    if (isPersonalized) {
      applyPersonalization();
    } else {
      setPersonalizedContent(content);
      onContentChange(content);
    }
  }, [isPersonalized, content, user, isAuthenticated]);

  const applyPersonalization = () => {
    if (!user?.profile) {
      setPersonalizedContent(content);
      onContentChange(content);
      return;
    }

    const { softwareBackground } = user.profile;
    let modifiedContent = content;

    // Apply personalization based on software background
    switch (softwareBackground) {
      case 'beginner':
        // Simplify explanations and add more examples
        modifiedContent = content
          .replace(/\*\*Technical Detail\*\*[^]*?\n\n/g, '') // Remove advanced technical sections
          .replace(/\*\*Implementation Focus\*\*/g, '**Explanation**') // Replace complex with simple
          .replace(/(For more advanced users:)[^]*?(?=\n\n|$)/g, ''); // Remove advanced notes
          
        // Add beginner-friendly explanations
        modifiedContent = modifiedContent.replace(
          /([A-Z][a-z]+(?: [A-Z][a-z]+)*)/g,
          (match) => `**${match}** (simplified explanation: ${match.toLowerCase()})`
        );
        break;

      case 'intermediate':
        // Provide balanced content
        modifiedContent = content
          .replace(/\*\*For Experts Only\*\*[^]*?\n\n/g, '') // Remove expert-only sections
          .replace(/\*\*Basic Overview\*\*/g, '**Detailed Explanation**'); // Enhance with more detail
        break;

      case 'advanced':
        // Add technical depth and implementation details
        modifiedContent = content
          .replace(/\*\*Simplified Explanation\*\*/g, '**Technical Implementation**')
          .replace(/(For beginners:)[^]*?(?=\n\n|$)/g, '')
          .replace(
            /([A-Z][a-z]+(?: [A-Z][a-z]+)*)/g,
            (match) => `**${match}** (Implementation note: ${match.toLowerCase()} can be optimized using...)`
          );
        break;

      default:
        modifiedContent = content;
    }

    setPersonalizedContent(modifiedContent);
    onContentChange(modifiedContent);
  };

  if (!isAuthenticated) {
    return (
      <div className="alert alert--warning margin-bottom--md" role="alert">
        Sign in to enable personalized content based on your profile.
      </div>
    );
  }

  return (
    <div className="personalization-controls margin-bottom--md">
      <div className="button-group button-group--block">
        <button
          className={`button ${isPersonalized ? 'button--primary' : 'button--secondary'}`}
          onClick={() => setIsPersonalized(!isPersonalized)}
          disabled={!user?.profile}
        >
          {isPersonalized ? 'Disable Personalization' : 'Personalize Content'}
        </button>
      </div>
      
      {user?.profile && (
        <div className="alert alert--info margin-top--sm" role="alert">
          <small>
            <strong>Profile:</strong> {user.profile.softwareBackground} background, 
            {user.profile.programmingLanguages?.length > 0 && ` knows ${user.profile.programmingLanguages.join(', ')}`}
          </small>
        </div>
      )}
    </div>
  );
};

export default Personalization;