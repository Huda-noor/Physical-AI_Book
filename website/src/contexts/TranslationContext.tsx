import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface TranslationContextType {
  currentLanguage: string;
  setLanguage: (lang: string, chapterId: number) => Promise<void>;
  isTranslating: boolean;
  translationError: string | null;
  translatedContent: string | null;
  clearTranslation: () => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const clearTranslation = () => {
    setCurrentLanguage('en');
    setTranslatedContent(null);
    setTranslationError(null);
  };

  const setLanguage = async (lang: string, chapterId: number) => {
    if (lang === 'en') {
      clearTranslation();
      return;
    }

    if (!isAuthenticated) {
      setTranslationError('Please sign in to use translation.');
      return;
    }

    setCurrentLanguage(lang);
    setIsTranslating(true);
    setTranslationError(null);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapter_id: chapterId, target_lang: lang }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Translation failed');
      }

      const data = await response.json();
      setTranslatedContent(data.translated_markdown);
    } catch (err: any) {
      setTranslationError(err.message);
      setCurrentLanguage('en');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <TranslationContext.Provider value={{
      currentLanguage,
      setLanguage,
      isTranslating,
      translationError,
      translatedContent,
      clearTranslation
    }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) throw new Error('useTranslation must be used within TranslationProvider');
  return context;
};
