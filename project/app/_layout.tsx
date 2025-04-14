import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppSplashScreen } from '@/components/splash/AppSplashScreen';

// No need to prevent splash screen auto-hiding here as it's handled in AppSplashScreen

export default function RootLayout() {
  useFrameworkReady();
  
  return (
    <AppSplashScreen>
      <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(pages)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </AppSplashScreen>
    
  );
}
