import { Redirect } from 'expo-router';

// This is just a placeholder for your authentication logic
const isAuthenticated = false; // Replace with actual auth state check

export default function Index() {
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}
