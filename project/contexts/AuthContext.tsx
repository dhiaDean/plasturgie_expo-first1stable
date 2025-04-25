import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Adjust path based on your project structure
import { apiService } from '../app/services/api.service';
import { AuthResponse, RegisterRequest, User, ApiError, AuthRequest } from '../app/services/api.types';

interface AuthContextType {
  user: User | null;
  token: string | null; // Expose token if needed elsewhere, though maybe not necessary
  login: (response: AuthResponse) => Promise<void>; // Login function takes the response directly
  performLogin: (credentials: AuthRequest) => Promise<void>; // New function to perform login API call
  register: (registerData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>; // Make logout async
  isLoading: boolean; // Indicates auth state is being checked/updated
  isAuthenticated: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'user';
const TOKEN_STORAGE_KEY = 'token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading until auth is checked

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
          apiService.setToken(storedToken); // Set token in API service
          setToken(storedToken);

          // Option 1: Trust stored user data initially (faster load)
          if (storedUserString) {
            try {
              const storedUser = JSON.parse(storedUserString);
              setUser(storedUser);
              console.log('Loaded user from storage:', storedUser.username);
            } catch (e) {
              console.error("Failed to parse stored user data", e);
              // Clear invalid stored user data
              await AsyncStorage.removeItem(USER_STORAGE_KEY);
            }
          }
          // Option 2: Always verify token with API (more secure, slightly slower load)
          // Comment out Option 1's user loading if using this
          // try {
          //    console.log('Verifying token with API...');
          //    const freshUserData = await apiService.getCurrentUser();
          //    setUser(freshUserData);
          //    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(freshUserData));
          //    console.log('User data refreshed from API:', freshUserData.username);
          // } catch (verifyError: any) {
          //    console.error('Token verification failed:', verifyError.message);
          //    // If token is invalid (e.g., 401), clear everything
          //    if (verifyError.response?.status === 401) {
          //        await clearAuthData();
          //    }
          // }

        } else {
          console.log('No token found in storage.');
          apiService.clearToken(); // Ensure service token is null
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        // Consider clearing storage on generic errors too?
        // await clearAuthData();
      } finally {
        setIsLoading(false);
        console.log('Auth initialization finished.');
      }
    };

    initializeAuth();
  }, []); // Run only once on mount


  // --- Clear Auth Data Helper ---
   const clearAuthData = async () => {
        console.log('Clearing auth data from storage and state.');
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
        apiService.clearToken();
        setToken(null);
        setUser(null);
   };

  // --- Login ---
  // Takes AuthResponse after successful API call
  const login = useCallback(async (response: AuthResponse): Promise<void> => {
    console.log('Handling login response...');
    setIsLoading(true); // Indicate state update is happening
    try {
      if (!response || !response.access_token || !response.user_id) {
        throw new Error('Invalid authentication response received');
      }

      const {
        access_token: receivedToken, // <-- Destructure access_token as receivedToken
        user_id: receivedUserId,     // <-- Destructure user_id as receivedUserId
        username,
        email,
        role
    } = response;
      const userData: User = { id: receivedUserId, username, email, role };

      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, receivedToken);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

      apiService.setToken(receivedToken);
      setToken(receivedToken);
      setUser(userData);
      console.log('User logged in:', userData.username);
    } catch (error) {
      console.error('Failed to process login response:', error);
      await clearAuthData(); // Clear any partial data on error
      throw error; // Re-throw for the UI layer
    } finally {
        setIsLoading(false);
    }
  }, []);

  // --- Perform Login API Call ---
  // Separated function to call the API, then calls login() on success
  const performLogin = useCallback(async (credentials: AuthRequest): Promise<void> => {
    console.log('Performing login API call...');
    setIsLoading(true);
    try {
        const response = await apiService.login(credentials);
        await login(response); // Handle the successful response
    } catch (error) {
        console.error('API login request failed:', error);
        // Optionally handle specific error messages for UI feedback
        await clearAuthData(); // Ensure cleanup on failure
        throw error; // Re-throw for the UI layer
    } finally {
        setIsLoading(false);
    }
  }, [login]); // Depends on the memoized login function


  // --- Register ---
  const register = useCallback(async (registerData: RegisterRequest): Promise<void> => {
    console.log('Performing register API call...');
    setIsLoading(true);
    try {
      // API call doesn't return user/token, user needs to login after register
      await apiService.register(registerData);
      console.log('Registration successful via API.');
      // Optionally show a success message or navigate to login
    } catch (error) {
      console.error('Registration API request failed:', error);
      throw error; // Re-throw for the UI layer
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- Logout ---
  const logout = useCallback(async (): Promise<void> => {
    console.log('Performing logout...');
    setIsLoading(true);
    try {
        // Attempt server logout first, but proceed regardless
        await apiService.logout(); // apiService.logout already clears its internal token
    } catch(error) {
         console.warn('Server logout failed, proceeding with client-side logout:', error);
    } finally {
        await clearAuthData(); // Clear local storage and state
        setIsLoading(false);
        console.log('User logged out.');
        // Navigate to login screen (handle this in your navigation setup)
    }
  }, []);

  // --- Refresh User Data ---
   const refreshUserData = useCallback(async (): Promise<void> => {
    console.log('Attempting to refresh user data...');
     if (!token) {
       console.log('No token available, cannot refresh.');
       // Optionally clear user state if token is missing but user exists?
       // if (user) setUser(null);
       return;
     }
     setIsLoading(true); // Indicate refresh is happening
     try {
       apiService.setToken(token); // Ensure API service has the current token
       const freshUserData = await apiService.getCurrentUser();
       setUser(freshUserData);
       await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(freshUserData));
       console.log('User data refreshed:', freshUserData.username);
     } catch (error: any) {
       console.error('Failed to refresh user data:', error);
       // If token is invalid (401), log out the user
       if (error.response?.status === 401) {
         console.warn('Token expired or invalid during refresh, logging out.');
         await logout(); // Use the async logout function
       }
       // Do not throw error here usually, as it might disrupt background refreshes
     } finally {
       setIsLoading(false);
     }
   }, [token, logout]); // Depend on token and logout


  return (
    <AuthContext.Provider
      value={{
        user,
        token, // Expose token
        login, // Use this after getting response from API
        performLogin, // Use this from login screen UI
        register,
        logout,
        isLoading,
        isAuthenticated: !!user && !!token, // Base authentication on having both user and token
        refreshUserData,
      }}
    >
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
