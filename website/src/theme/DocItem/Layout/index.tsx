/**
 * DocItem Layout Wrapper
 *
 * Custom wrapper for Docusaurus doc pages that adds personalization
 * and translation buttons to chapter pages.
 *
 * This component wraps the default DocItem/Layout component and injects
 * custom UI elements (PersonalizeButton, TranslateButton) at the top.
 */
import React from 'react';
import Layout from '@theme-original/DocItem/Layout';
import type LayoutType from '@theme/DocItem/Layout';
import type { WrapperProps } from '@docusaurus/types';
import PersonalizeButton from '../../../components/PersonalizeButton';
import TranslateButton from '../../../components/TranslateButton';
import { useTranslation } from '../../../contexts/TranslationContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = WrapperProps<typeof LayoutType>;

export default function LayoutWrapper(props: Props): JSX.Element {
  const { isPersonalized } = usePersonalization();
  const { currentLanguage, translatedContent, isTranslating } = useTranslation();
  const location = useLocation();

  // Extract chapter ID from path (e.g., /docs/chapter-1-...)
  const getChapterId = (pathname: string): number | null => {
    const match = pathname.match(/chapter-(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  const chapterId = getChapterId(location.pathname);
  const isChapterPage = chapterId !== null;

  return (
    <>
      {/* Action buttons bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '16px',
          padding: '8px 0',
          borderBottom: '1px solid var(--ifm-color-emphasis-200)',
        }}
      >
        {isChapterPage && <PersonalizeButton />}
        <TranslateButton />
      </div>

      {/* Render original layout, personalized, or translated content */}
      {isTranslating ? (
        <div className="container margin-vert--xl text--center">
          <div className="loading-spinner"></div>
          <p>Translating chapter to {currentLanguage}...</p>
        </div>
      ) : currentLanguage !== 'en' && translatedContent ? (
        <Layout {...props}>
          <div className={`translated-markdown-content ${currentLanguage === 'ur' ? 'rtl-content' : ''}`}>
            <div className="alert alert--info margin-bottom--md">
              ✨ This chapter has been translated into {currentLanguage}.
              <button className="button button--link" onClick={() => window.location.reload()}>Back to English</button>
            </div>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {translatedContent}
            </ReactMarkdown>
          </div>
        </Layout>
      ) : isPersonalized && isChapterPage ? (
        <Layout {...props}>
          <PersonalizedContent
            chapterId={chapterId}
            originalContent=""
          />
        </Layout>
      ) : (
        <Layout {...props} />
      )}
    </>
  );
}
