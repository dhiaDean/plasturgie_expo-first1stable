import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();
  
  // Replace this with your actual authentication state check
  // You might want to use AsyncStorage, Context API, or other state management
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
        
        {/* Conditional group rendering based on auth state */}
        {isAuthenticated ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
