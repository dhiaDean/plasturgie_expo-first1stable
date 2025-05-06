import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Adjust path based on your project structure
import { apiService } from '@/app/services/api.service'; // Assuming services is at root/app/services
import {
    AuthRequest,
    AuthResponse,
    RegisterRequest,
    User,
    ApiError // Keep ApiError if used
} from '@/app/services/api.types'; // Assuming services is at root/app/services

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (response: AuthResponse) => Promise<void>; // Login function takes the response directly
  performLogin: (credentials: AuthRequest) => Promise<void>; // Function to perform login API call
  register: (registerData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>; // Make logout async
  isLoading: boolean; // Indicates auth state is being checked/updated
  isAuthenticated: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'user_data_key'; // Use distinct keys
const TOKEN_STORAGE_KEY = 'auth_token_key'; // Use distinct keys

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading until auth is checked

  // --- Clear Auth Data Helper ---
  const clearAuthData = useCallback(async () => {
      console.log('Clearing auth data from storage and state.');
      try {
          await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_STORAGE_KEY]);
          apiService.setToken(null); // Use null for clarity
          setToken(null);
          setUser(null);
      } catch (e) {
          console.error("Failed to clear auth data:", e);
      }
  }, []); // No dependencies

  // --- Load Initial State ---
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing auth...');
      setIsLoading(true);
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        const storedUserString = await AsyncStorage.getItem(USER_STORAGE_KEY);

        if (storedToken) {
          console.log('Found token in storage.');
          apiService.setToken(storedToken);
          setToken(storedToken);

          if (storedUserString) {
            try {
        const storedUser = JSON.parse(storedUserString);
              setUser(storedUser);
              console.log('AuthContext initializeAuth: user loaded from storage:', JSON.stringify(storedUser));
              console.log('Loaded user from storage:', storedUser.username);
              // Optionally trigger a background refresh on load if desired
              // refreshUserData(); // Be careful not to cause infinite loops
            } catch (e) {
              console.error("Failed to parse stored user data, clearing auth.", e);
              await clearAuthData(); // Clear invalid data
            }
          } else {
               // Has token but no user data? Try to refresh.
               console.log("Token found but no user data, attempting refresh...");
               await refreshUserData(storedToken); // Pass token directly if state not set yet
          }

        } else {
          console.log('No token found in storage.');
          apiService.clearToken(); // Ensure service token is null
          setUser(null); // Ensure user is null if no token
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        await clearAuthData(); // Clear auth on significant errors
      } finally {
        setIsLoading(false);
        console.log('Auth initialization finished.');
      }
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount - disabled exhaustive-deps for initializeAuth

  // --- Login ---
  // Takes AuthResponse after successful API call
  const login = useCallback(async (response: AuthResponse): Promise<void> => {
    console.log('Handling login response...');
    setIsLoading(true); // Indicate state update is happening
    try {
      // *** USE MODIFIED FIELD NAMES FOR CHECKING AND DESTRUCTURING ***
      if (!response || !response.access_token || !response.user_id) { // <-- Check for access_token and user_id
        throw new Error('Invalid authentication response received (Missing access_token or user_id)');
      }

      const {
          access_token: receivedToken, // <-- Destructure access_token as receivedToken
          user_id: receivedUserId,     // <-- Destructure user_id as receivedUserId
          username,
          email,
          role
      } = response;
      // *** END OF MODIFICATIONS ***

      // Construct the User object for state/storage (using 'id' as the key internally)
      const userData: User = {
          id: receivedUserId, // <-- Use receivedUserId here
          username,
          email,
          role
      };
      console.log('AuthContext login: userData being set:', JSON.stringify(userData));

      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, receivedToken); // Store the token
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData)); // Store the user data

      apiService.setToken(receivedToken); // Set token in service
      setToken(receivedToken); // Set token in state
      setUser(userData); // Set user in state
      console.log('User logged in:', userData.username);
    } catch (error) {
      console.error('Failed to process login response:', error);
      await clearAuthData(); // Clear any partial data on error
      throw error; // Re-throw for the UI layer
    } finally {
        setIsLoading(false);
    }
  }, [clearAuthData]); // Depends on clearAuthData

  // --- Perform Login API Call ---
  const performLogin = useCallback(async (credentials: AuthRequest): Promise<void> => {
    console.log('Performing login API call...');
    setIsLoading(true);
    try {
        const response = await apiService.login(credentials);
        await login(response); // Handle the successful response using the login callback
    } catch (error) {
        console.error('API login request failed:', error);
        await clearAuthData(); // Ensure cleanup on failure
        throw error; // Re-throw for the UI layer
    } finally {
        setIsLoading(false);
    }
  }, [login, clearAuthData]); // Depends on login and clearAuthData callbacks

  // --- Register ---
  const register = useCallback(async (registerData: RegisterRequest): Promise<void> => {
    console.log('Performing register API call...');
    setIsLoading(true);
    try {
      await apiService.register(registerData);
      console.log('Registration successful via API.');
    } catch (error) {
      console.error('Registration API request failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies

  // --- Logout ---
  const logout = useCallback(async (): Promise<void> => {
    console.log('Performing logout...');
    setIsLoading(true); // Optional: show loading during logout
    try {
        // Attempt server logout first, but proceed regardless
        await apiService.logout(); // apiService.logout already clears its internal token
    } catch(error) {
         console.warn('Server logout failed, proceeding with client-side logout:', error);
    } finally {
        await clearAuthData(); // Clear local storage and state
        setIsLoading(false); // Set loading false after clearing
        console.log('User logged out.');
        // Navigation is handled by RootLayoutNav effect
    }
  }, [clearAuthData]); // Depends on clearAuthData

  // --- Refresh User Data ---
   const refreshUserData = useCallback(async (currentToken?: string | null): Promise<void> => {
    const tokenToUse = currentToken ?? token; // Use passed token or state token
    console.log('Attempting to refresh user data...');
     if (!tokenToUse) {
       console.log('No token available, cannot refresh.');
       // If user exists without token, clear user state for consistency
       if (user) setUser(null);
       return;
     }
     // Avoid concurrent refreshes if already loading
     if (isLoading && !currentToken) return;

     setIsLoading(true); // Indicate refresh is happening
     try {
       apiService.setToken(tokenToUse); // Ensure API service has the current token
       const freshUserData = await apiService.getCurrentUser();
       setUser(freshUserData);
       await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(freshUserData));
       console.log('AuthContext refreshUserData: fresh data from API:', JSON.stringify(freshUserData));
       console.log('User data refreshed:', freshUserData.username);
     } catch (error: any) {
       console.error('Failed to refresh user data:', error);
       if (error.response?.status === 401) {
         console.warn('Token expired or invalid during refresh, logging out.');
         await logout(); // Use the async logout function
       }
     } finally {
       setIsLoading(false);
     }
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [token, user, logout, isLoading]); // Depend on token, user, logout, isLoading

  // --- Context Value ---
  const authContextValue = useMemo(() => ({
        user,
        token,
        login,
        performLogin,
        register,
        logout,
        isLoading,
        isAuthenticated: !!user && !!token, // Base authentication on having both user and token
        refreshUserData,
  }), [user, token, login, performLogin, register, logout, isLoading, refreshUserData]);


  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// --- useAuth Hook ---
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
