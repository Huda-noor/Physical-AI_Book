/**
 * ChatbotIcon - Floating chatbot launcher button
 *
 * Displays a floating icon in the bottom-right corner of the page.
 * Clicking it opens the chatbot modal.
 */
import React from 'react';

interface ChatbotIconProps {
  onClick: () => void;
  hasUnread?: boolean;
}

export default function ChatbotIcon({
  onClick,
  hasUnread = false,
}: ChatbotIconProps): JSX.Element {
  return (
    <button
      className="chatbot-icon"
      onClick={onClick}
      aria-label="Open chatbot assistant"
      title="Ask the textbook assistant"
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Chat bubble icon */}
        <path
          d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
          fill="currentColor"
        />
        <circle cx="8" cy="9" r="1.5" fill="white" />
        <circle cx="12" cy="9" r="1.5" fill="white" />
        <circle cx="16" cy="9" r="1.5" fill="white" />
      </svg>
      {hasUnread && <span className="chatbot-icon-badge" />}
    </button>
  );
}
