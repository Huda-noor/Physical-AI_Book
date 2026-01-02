import React, { ReactNode, useState } from 'react';
import { AuthProvider } from '@site/src/contexts/AuthContext';
import { PersonalizationProvider } from '@site/src/contexts/PersonalizationContext';
import ChatbotIcon from '@site/src/components/ChatbotIcon';
import ChatbotModal from '@site/src/components/ChatbotModal';
import useChatbot from '@site/src/hooks/useChatbot';

import { TranslationProvider } from '@site/src/contexts/TranslationContext';

export default function Root({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isLoading, error, sendMessage } = useChatbot();

  return (
    <AuthProvider>
      <PersonalizationProvider>
        <TranslationProvider>
          {children}
          {/* Global chatbot available on every page */}
          <ChatbotIcon onClick={() => setIsOpen(true)} />
          <ChatbotModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            messages={messages}
            isLoading={isLoading}
            error={error}
            onSendMessage={sendMessage}
          />
        </TranslationProvider>
      </PersonalizationProvider>
    </AuthProvider>
  );
}