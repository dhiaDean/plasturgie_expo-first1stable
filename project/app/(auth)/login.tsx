// app/(auth)/login.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert, // Import Alert for error messages
    ActivityIndicator, // Import ActivityIndicator for loading state
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRequest } from '@/app/services/api.types'; // Import the type

// Reusing theme colors (adapt if needed)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc', // Light background
    },
    formContainer: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b', // Dark text
        marginBottom: 32, // Increased margin
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20, // Increased margin
    },
    label: {
        fontSize: 14, // Slightly smaller label
        marginBottom: 8,
        fontWeight: '500',
        color: '#334155', // Darker gray label
    },
    input: {
        backgroundColor: '#ffffff', // White input
        height: 50,
        borderRadius: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#cbd5e1', // Lighter border
        fontSize: 16, // Ensure font size is appropriate
        color: '#1e293b',
    },
    button: {
        backgroundColor: '#2563eb', // Accent blue
        borderRadius: 8,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        flexDirection: 'row', // To align text and activity indicator
    },
    buttonDisabled: {
         backgroundColor: '#93c5fd', // Lighter blue when disabled
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingIndicator: {
        marginLeft: 10,
    },
    linksContainer: {
        marginTop: 24,
        alignItems: 'center',
    },
    link: {
        color: '#2563eb', // Accent blue
        fontSize: 14,
        marginVertical: 8,
    },
    errorText: { // Style for error messages below fields (optional)
        color: '#dc2626', // Red
        fontSize: 12,
        marginTop: 4,
    }
});


export default function LoginScreen() {
  // Assuming login uses 'username', but email might also work depending on backend
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null); // For displaying API errors

  // Get functions and state from AuthContext
  const { performLogin, isLoading } = useAuth();

  const handleLogin = async () => {
    setLocalError(null); // Clear previous errors

    // Basic frontend validation
    if (!usernameOrEmail || !password) {
      Alert.alert('Error', 'Please enter both username/email and password');
      return;
    }

    const credentials: AuthRequest = {
      username: usernameOrEmail, // Use the state variable here
      password: password,
    };

    try {
        console.log('Attempting login with:', credentials.username);
        await performLogin(credentials);
        console.log('Login successful, navigating...');
        // Navigate to the main part of the app after successful login
        // Replace '/(tabs)/' with your actual main app route group or initial screen
        router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login failed:', error);
      // Extract message from the error structure provided by api.service
      const message = error?.response?.data?.message || error?.message || 'Login failed. Please check your credentials.';
      setLocalError(message); // Set local state to display error near form
      Alert.alert('Login Failed', message); // Also show a popup alert
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>

        {/* Optional: Display API error message near the top */}
        {/* {localError && <Text style={styles.errorText}>{localError}</Text>} */}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username or Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter username or email"
            value={usernameOrEmail}
            onChangeText={setUsernameOrEmail}
            keyboardType="email-address" // Keeps common keyboard type
            autoCapitalize="none"
            autoComplete="username" // Help password managers
            editable={!isLoading} // Disable input while loading
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password" // Help password managers
            editable={!isLoading} // Disable input while loading
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]} // Apply disabled style
          onPress={handleLogin}
          disabled={isLoading} // Disable button while loading
        >
          <Text style={styles.buttonText}>Login</Text>
          {isLoading && ( // Show loading indicator next to text
            <ActivityIndicator size="small" color="#ffffff" style={styles.loadingIndicator} />
          )}
        </TouchableOpacity>

        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')} disabled={isLoading}>
            <Text style={styles.link}>Don't have an account? Sign up</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} disabled={isLoading}>
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
