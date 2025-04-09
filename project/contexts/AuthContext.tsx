import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { router, useSegments } from 'expo-router';

type AuthContextType = {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  login: (email: string, password: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const segments = useSegments();

  // Simple login function - replace with your actual auth logic
  const login = (email: string, password: string) => {
    // Add your authentication logic here (API calls, etc.)
    if (email && password) {
      setAuthenticated(true);
    }
  };

  // Simple logout function
  const logout = () => {
    setAuthenticated(false);
  };

  useEffect(() => {
    // This simulates checking for a saved token or other auth check
    // In a real app, you might check AsyncStorage or SecureStore
    const checkAuth = async () => {
      try {
        // Simulate a short delay to ensure initial rendering
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // By default we're not authenticated
        setAuthenticated(false);
        setLoading(false);
      } catch (error) {
        console.error('Error checking auth status', error);
        setAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle routing based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the login page if not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to the main app if authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setAuthenticated,
        login,
        logout,
      }}
    >
      {!isLoading ? children : null}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
