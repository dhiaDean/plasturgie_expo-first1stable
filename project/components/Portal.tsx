import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';

// Global variable to hold portal host
let portalRoot: View | null = null;

// Set portal host reference
export function setPortalRoot(ref: View) {
  portalRoot = ref;
}

// Portal component
const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    // Force a re-render after mount to ensure portal host is available
    forceUpdate({});
  }, []);

  // If there's no portal host, we don't render anything
  if (!portalRoot) {
    return null;
  }

  // Use React's unstable_renderSubtreeIntoContainer API to render into the portal host
  // This is a simplified approach for React Native
  return React.cloneElement(
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {children}
    </View>
  );
};

export default Portal;