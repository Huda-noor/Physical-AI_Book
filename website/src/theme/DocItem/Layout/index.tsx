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

// Import styles
import '../../../css/personalize.css';
import '../../../css/translate.css';

type Props = WrapperProps<typeof LayoutType>;

export default function LayoutWrapper(props: Props): JSX.Element {
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
        <PersonalizeButton />
        <TranslateButton />
      </div>

      {/* Render original layout */}
      <Layout {...props} />
    </>
  );
}
