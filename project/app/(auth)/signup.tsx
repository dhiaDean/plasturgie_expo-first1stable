// app/(auth)/signup.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView, // Use ScrollView if form gets long
    Alert,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { RegisterRequest } from '@/app/services/api.types'; // Import the type

// Reusing theme colors
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc', // Light background
    },
    scrollContainer: {
        flexGrow: 1, // Ensure content can scroll if needed
        justifyContent: 'center',
    },
    formContainer: {
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b', // Dark text
        marginBottom: 32,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 18, // Consistent margin
    },
    label: {
        fontSize: 14,
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
        fontSize: 16,
        color: '#1e293b',
    },
    button: {
        backgroundColor: '#2563eb', // Accent blue
        borderRadius: 8,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        flexDirection: 'row',
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
    errorText: {
        color: '#dc2626', // Red
        fontSize: 12,
        marginTop: 4,
    }
});

export default function SignupScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Get register function and loading state from AuthContext
  const { register, isLoading } = useAuth();

  const handleSignup = async () => {
    setLocalError(null); // Clear previous errors

    // Frontend Validation
    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }
    // Add more validation if needed (email format, password strength)

    const registerData: RegisterRequest = {
      firstName,
      lastName,
      username,
      email,
      password,
      // Role is optional in the type, backend might assign default or require specific logic
      // role: 'ROLE_LEARNER' // Example: Assign a default role if needed
    };

    try {
        console.log('Attempting registration for:', registerData.username);
        await register(registerData);
        console.log('Registration successful.');

        Alert.alert(
            'Account Created',
            'Your account has been created successfully. Please log in.',
            [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }] // Navigate after alert dismissed
        );

    } catch (error: any) {
        console.error('Signup failed:', error);
        const message = error?.response?.data?.message || error?.message || 'Registration failed. Please try again.';
        setLocalError(message);
        Alert.alert('Registration Failed', message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Use ScrollView to prevent content being hidden by keyboard */}
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>

          {/* Optional: Display API error message */}
          {/* {localError && <Text style={styles.errorText}>{localError}</Text>} */}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Choose a username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
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
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
            {isLoading && (
              <ActivityIndicator size="small" color="#ffffff" style={styles.loadingIndicator} />
            )}
          </TouchableOpacity>

          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')} disabled={isLoading}>
              <Text style={styles.link}>Already have an account? Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
