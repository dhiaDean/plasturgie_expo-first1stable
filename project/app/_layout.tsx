import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router'; // Import router hooks
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native'; // For loading indicator
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { AppSplashScreen } from '@/components/splash/AppSplashScreen';

// This component will handle the navigation logic based on auth state
function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments(); // Gets the current route segments, e.g., ['(auth)', 'login']
  const router = useRouter();

  useEffect(() => {
    // Wait until the auth state is loaded before trying to redirect
    if (isLoading) {
        console.log('Auth state still loading, waiting...');
        return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    console.log(`Auth loaded. IsAuthenticated: ${isAuthenticated}, InAuthGroup: ${inAuthGroup}`);


    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the login page if the user is not authenticated
      // and is not already in the (auth) group.
      console.log('User not authenticated and not in auth group, redirecting to login...');
      router.replace('/(auth)/login'); // Use replace to prevent back navigation
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to the main app (tabs) if the user is authenticated
      // and currently in the (auth) group (e.g., after logging in).
      console.log('User authenticated and in auth group, redirecting to tabs...');
      router.replace('/(tabs)'); // Adjust '/(tabs)/' if your main authenticated route is different
    }
     // No action needed if:
     // - !isAuthenticated && inAuthGroup (User is already in the right place)
     // - isAuthenticated && !inAuthGroup (User is already in the right place)

  }, [isAuthenticated, isLoading, segments, router]); // Re-run effect when auth state, loading state, or route changes


  // While the initial auth state is loading, you might want to show a global loading indicator
  // or rely on the AppSplashScreen. If AppSplashScreen handles it, this might be redundant.
  // Or, show loading *only* if NOT handled by AppSplashScreen and auth is loading
  // if (isLoading) { // Consider if this conflicts with AppSplashScreen
  //   return (
  //       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //           <ActivityIndicator size="large" color="#0000ff" />
  //       </View>
  //   );
  // }

  // Render the navigator now that redirection logic is handled
  return (
      <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Add (pages) group if it should also be protected/accessible when logged in */}
          <Stack.Screen name="(pages)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
      </Stack>
  );
}

// Main Root Layout component
export default function RootLayout() {
  // useFrameworkReady might be related to font loading or other setup
  // Ensure it doesn't interfere with the splash screen hiding logic
  useFrameworkReady();

  return (
    // AppSplashScreen handles initial loading/hiding
    <AppSplashScreen>
      {/* AuthProvider provides the context */}
      <AuthProvider>
        {/* RootLayoutNav consumes the context and handles routing */}
        <RootLayoutNav />
        <StatusBar style="auto" />
      </AuthProvider>
    </AppSplashScreen>
  );
}