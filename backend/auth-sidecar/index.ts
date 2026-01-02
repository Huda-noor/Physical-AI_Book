/**
 * Better Auth Sidecar - Authentication server for Phase 3
 *
 * This sidecar provides Better Auth endpoints using Neon PostgreSQL as the database.
 * It runs on port 3001 and handles all authentication operations.
 */

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

// PostgreSQL connection
import pg from "pg";

// Types
import type { User, Session, SessionResponse } from "./types.js";

// Initialize PostgreSQL client
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Initialize Hono app
const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// ============================================================
// Utility Functions
// ============================================================

/**
 * Hash password using bcrypt-compatible approach
 */
async function hashPassword(password: string): Promise<string> {
  // Simple implementation - in production use bcrypt
  // For now, using a basic hash for demonstration
  const textEncoder = new TextEncoder();
  const data = textEncoder.encode(password + process.env.PASSWORD_SALT || "salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verify password
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Generate random session token
 */
function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generate UUID
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Set session cookie
 */
function setSessionCookie(userId: string, sessionToken: string, expiresAt: Date) {
  const maxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `better-auth.session_token=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`,
    },
  });
}

// ============================================================
// Database Query Functions
// ============================================================

async function createUser(email: string, passwordHash: string, name?: string): Promise<User> {
  const userId = generateUUID();
  const now = new Date();

  const result = await pool.query(
    `INSERT INTO users (id, email, email_verified, name, created_at, updated_at)
     VALUES ($1, $2, FALSE, $3, $4, $5)
     RETURNING *`,
    [userId, email, name || null, now, now]
  );

  return result.rows[0];
}

async function getUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0] || null;
}

async function createSession(userId: string): Promise<Session> {
  const sessionId = generateUUID();
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const now = new Date();

  await pool.query(
    `INSERT INTO sessions (id, user_id, expires_at, session_token, created_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [sessionId, userId, expiresAt, sessionToken, now]
  );

  return {
    id: sessionId,
    userId,
    expiresAt,
    sessionToken,
    createdAt: now,
  };
}

async function getSession(sessionToken: string): Promise<SessionResponse | null> {
  const result = await pool.query(
    `SELECT s.*, u.* FROM sessions s
     INNER JOIN users u ON s.user_id = u.id
     WHERE s.session_token = $1 AND s.expires_at > NOW()`,
    [sessionToken]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const session = result.rows[0];
  return {
    session: {
      id: session.id,
      userId: session.user_id,
      expiresAt: session.expires_at,
      sessionToken: session.session_token,
      createdAt: session.created_at,
    },
    user: {
      id: session.user_id,
      email: session.email,
      emailVerified: session.email_verified,
      name: session.name,
      image: session.image,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    },
  };
}

async function deleteSession(sessionToken: string): Promise<void> {
  await pool.query("DELETE FROM sessions WHERE session_token = $1", [sessionToken]);
}

// ============================================================
// Auth Routes
// ============================================================

/**
 * POST /api/auth/signup
 * Create a new user account
 */
app.post("/api/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    // Validation
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    if (!email.includes("@")) {
      return c.json({ error: "Invalid email address" }, 400);
    }

    if (password.length < 8) {
      return c.json({ error: "Password must be at least 8 characters" }, 400);
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return c.json({ error: "User already exists" }, 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await createUser(email, passwordHash, name);

    return c.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.email_verified,
          name: user.name,
        },
      },
      201
    );
  } catch (error) {
    console.error("Signup error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * POST /api/auth/signin
 * Sign in an existing user
 */
app.post("/api/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();

    // Validation
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Get user
    const user = await getUserByEmail(email);
    if (!user) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    // Create session
    const session = await createSession(user.id);

    // Set cookie and return session data
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.email_verified,
          name: user.name,
        },
        session: {
          id: session.id,
          expiresAt: session.expiresAt,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `better-auth.session_token=${session.sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
        },
      }
    );
  } catch (error) {
    console.error("Signin error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * GET /api/auth/session
 * Get current session
 */
app.get("/api/auth/session", async (c) => {
  try {
    // Get session token from cookie
    const cookieHeader = c.req.header("Cookie");
    let sessionToken: string | null = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(";").map((c) => c.trim());
      const sessionCookie = cookies.find((c) => c.startsWith("better-auth.session_token="));
      sessionToken = sessionCookie ? sessionCookie.split("=")[1] : null;
    }

    // Try Authorization header as fallback
    if (!sessionToken) {
      const authHeader = c.req.header("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.split(" ")[1];
      }
    }

    if (!sessionToken) {
      return c.json({ error: "No session" }, 401);
    }

    // Get session from database
    const session = await getSession(sessionToken);
    if (!session) {
      return c.json({ error: "Invalid or expired session" }, 401);
    }

    return c.json(session);
  } catch (error) {
    console.error("Session error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * POST /api/auth/signout
 * Sign out and delete session
 */
app.post("/api/auth/signout", async (c) => {
  try {
    const cookieHeader = c.req.header("Cookie");
    let sessionToken: string | null = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(";").map((c) => c.trim());
      const sessionCookie = cookies.find((c) => c.startsWith("better-auth.session_token="));
      sessionToken = sessionCookie ? sessionCookie.split("=")[1] : null;
    }

    if (sessionToken) {
      await deleteSession(sessionToken);
    }

    // Clear cookie
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": "better-auth.session_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
        },
      }
    );
  } catch (error) {
    console.error("Signout error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "better-auth-sidecar",
    version: "1.0.0",
  });
});

/**
 * GET /
 * Root endpoint
 */
app.get("/", (c) => {
  return c.json({
    name: "Better Auth Sidecar",
    version: "1.0.0",
    endpoints: {
      signup: "POST /api/auth/signup",
      signin: "POST /api/auth/signin",
      session: "GET /api/auth/session",
      signout: "POST /api/auth/signout",
    },
  });
});

// ============================================================
// Start Server
// ============================================================

const PORT = process.env.PORT || 3001;

console.log(`🚀 Better Auth Sidecar starting on port ${PORT}...`);
console.log(`📝 Database: ${process.env.DATABASE_URL?.replace(/:[^:]+@/, ":****@")}`);
console.log(`🌐 CORS Origins: ${process.env.ALLOWED_ORIGINS || "http://localhost:3000"}`);

serve({
  fetch: app.fetch,
  port: PORT,
});

console.log(`✅ Server ready at http://localhost:${PORT}`);
