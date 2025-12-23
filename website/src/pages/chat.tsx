import React from 'react';
import Layout from '@theme/Layout';
import RAGChatbot from '@site/src/components/RAGChatbot';

export default function ChatPage(): JSX.Element {
  return (
    <Layout title="AI Tutor" description="Get help with Physical AI and Humanoid Robotics concepts">
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <div className="text--center padding-horiz--md">
              <h1>AI Tutor for Physical AI & Humanoid Robotics</h1>
              <p className="hero__subtitle">
                Ask questions about the course content and get personalized help based on your learning profile
              </p>
            </div>
            
            <div className="margin-vert--lg">
              <RAGChatbot />
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}