import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

interface AppSplashScreenProps {
  children: React.ReactNode;
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export function AppSplashScreen({ children }: AppSplashScreenProps) {
  const [isSplashReady, setSplashReady] = useState(false);

  // Load any resources or data here
  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make API calls, etc.
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // When everything is ready, mark as ready
        setSplashReady(true);
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setSplashReady(true);
      }
    }

    prepare();
  }, []);

  // When ready, hide the splash screen
  useEffect(() => {
    if (isSplashReady) {
      SplashScreen.hideAsync();
    }
  }, [isSplashReady]);

  if (!isSplashReady) {
    return null;
  }

  return children;
}
