import React from 'react';
import Layout from '@theme/Layout';
import SignupForm from '@site/src/components/SignupForm';

export default function SignupPage(): JSX.Element {
  return (
    <Layout title="Sign Up" description="Create an account for the AI-powered educational platform">
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--6 col--offset-3">
            <SignupForm />
          </div>
        </div>
      </main>
    </Layout>
  );
}