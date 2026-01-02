import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authClient } from '@site/src/auth/client';

// Match backend schema
interface SoftwareExperience {
  python: string;
  cpp: string;
  ros2: string;
  typescript: string;
}

interface UserProfile {
  software_experience: SoftwareExperience;
  robotics_experience: string;
  hardware_access: string[];
  learning_goals: string[];
  profile_hash?: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
  profile?: UserProfile;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: sessionData } = await authClient.getSession();
        if (sessionData?.user) {
          setSession(sessionData);
          await fetchProfile(sessionData.user);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const fetchProfile = async (authUser: any) => {
    try {
      const response = await fetch(`${apiUrl}/api/profile`, {
        credentials: 'include',
      });

      let profileData = null;
      if (response.ok) {
        profileData = await response.json();
      }

      setUser({
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
        profile: profileData,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUser({
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
      });
    }
  };

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchProfile(session.user);
    }
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateProfile = async (profile: UserProfile) => {
    try {
      const response = await fetch(`${apiUrl}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Update profile failed');
      }

      await refreshProfile();
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    signOut,
    updateProfile,
    refreshProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
