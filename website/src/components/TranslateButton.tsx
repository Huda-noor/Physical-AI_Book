/**
 * TranslateButton - Placeholder component for Urdu translation feature
 *
 * TODO: Future implementation should:
 * - Integrate with translation API (Google Translate, DeepL, or custom model)
 * - Store translations in cache to avoid repeated API calls
 * - Maintain markdown structure and code blocks during translation
 * - Support bidirectional text rendering (RTL for Urdu)
 * - Allow toggling between English and Urdu with smooth transitions
 * - Preserve technical terms in English (e.g., "Physical AI", "ROS 2")
 * - Translate UI elements (sidebar, buttons, labels)
 *
 * Phase 2 Implementation Requirements:
 * - Translation API integration (backend service)
 * - Caching layer for translated content (Redis or PostgreSQL)
 * - RTL layout support in CSS
 * - Language preference storage (localStorage)
 * - Fallback to English for untranslated sections
 * - Quality assurance for technical accuracy
 */
import React from 'react';

export default function TranslateButton(): JSX.Element {
  const handleClick = () => {
    alert(
      '🚧 Coming Soon!\n\n' +
      'Urdu translation will be available in Phase 2.\n\n' +
      'Planned features:\n' +
      '• Full chapter translation to Urdu (اردو)\n' +
      '• Right-to-left (RTL) text support\n' +
      '• Technical terms preserved in English\n' +
      '• Toggle between English and Urdu instantly\n' +
      '• Cached translations for faster loading\n' +
      '• Professional translation quality'
    );
  };

  return (
    <button
      className="translate-button"
      onClick={handleClick}
      aria-label="Translate chapter to Urdu"
      title="Translate this chapter to Urdu"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="translate-icon"
      >
        {/* Globe/language icon */}
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 12h20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="translate-text">اردو</span>
      <span className="translate-label">Urdu</span>
    </button>
  );
}
