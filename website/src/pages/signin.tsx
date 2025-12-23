import React from 'react';
import Layout from '@theme/Layout';
import SigninForm from '@site/src/components/SigninForm';

export default function SigninPage(): JSX.Element {
  return (
    <Layout title="Sign In" description="Sign in to your account for the AI-powered educational platform">
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--6 col--offset-3">
            <SigninForm />
          </div>
        </div>
      </main>
    </Layout>
  );
}