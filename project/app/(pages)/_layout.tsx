// File: app/(app)/_layout.tsx (NEW Layout for Authenticated App)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router'; // Or Slot, depending on needs here

// Import your actual Header component
import Header from '@/components/Header';

export default function AppLayout() {
  return (
    <View style={styles.appContainer}>
      {/* --- RENDER THE SHARED HEADER HERE --- */}
      {/* This header applies only to screens within the (app) group */}
      <Header />

      {/* --- Render the content for the (app) group --- */}
      {/* Stack manages navigation within (app), like between tabs and Cours */}
      <Stack screenOptions={{ headerShown: false }}>
         {/* Define screens only if needed for specific options */}
         {/* e.g., maybe tabs are the default */}
         <Stack.Screen name="(tabs)" />
         <Stack.Screen name="(pages)/event" />
         {/* Cours, certificates, etc. will be navigable if linked to */}
      </Stack>
      {/* OR just use Slot if Stack isn't needed here: <Slot /> */}

    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
});
