import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define the user profile type
interface UserProfile {
  softwareBackground: string; // beginner, intermediate, advanced
  programmingLanguages: string[]; // list of programming languages known
  roboticsExperience: string; // none, simulation-only, real hardware
  hardwareAccess: string[]; // GPU, Jetson, robot kits, none
}

// Define the user type
interface User {
  id: string;
  email: string;
  name?: string;
  profile?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

// Define the authentication context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, profile: UserProfile) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  isAuthenticated: boolean;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Function to check authentication status
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/auth/session', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data?.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3001/auth/sign-in/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sign in failed');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // Sign up function with profile data
  const signUp = async (email: string, password: string, name: string, profile: UserProfile) => {
    try {
      const response = await fetch('http://localhost:3001/auth/sign-up/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email, 
          password, 
          name,
          profile // Include the profile data during signup
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sign up failed');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await fetch('http://localhost:3001/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Update profile function
  const updateProfile = async (profile: UserProfile) => {
    try {
      const response = await fetch('http://localhost:3001/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ profile }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Update profile failed');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};