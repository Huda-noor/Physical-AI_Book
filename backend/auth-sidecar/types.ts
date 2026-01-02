/**
 * Type definitions for Better Auth sidecar
 */

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  sessionToken: string;
  createdAt: Date;
}

export interface SessionResponse {
  user: User;
  session: Session;
}
