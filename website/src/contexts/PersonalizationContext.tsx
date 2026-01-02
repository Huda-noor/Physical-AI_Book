import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PersonalizationContextType {
  isPersonalized: boolean;
  setIsPersonalized: (value: boolean) => void;
  isTranslating: boolean;
  setIsTranslating: (value: boolean) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

export const PersonalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [language, setLanguage] = useState('en');

  return (
    <PersonalizationContext.Provider
      value={{
        isPersonalized,
        setIsPersonalized,
        isTranslating,
        setIsTranslating,
        language,
        setLanguage,
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  );
};

export const usePersonalization = () => {
  const context = useContext(PersonalizationContext);
  if (context === undefined) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
};
