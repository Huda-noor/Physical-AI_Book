import React, { ReactNode } from 'react';
import { AuthProvider } from '@site/src/contexts/AuthContext';

export default function Root({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}