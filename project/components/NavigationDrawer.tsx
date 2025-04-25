import React, { useState } from 'react'; // Combined React imports
import { Alert } from 'react-native';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
    Switch,
    Image, // Keep Image for potential future use
    Modal
} from 'react-native';
import { useRouter } from 'expo-router';
// Assuming lucide icons are correctly installed and working
import {
    Home, Book, Award, GraduationCap, ClipboardList, Building2, Calendar,
    MessageSquare, Newspaper, CreditCard, PenTool as Tool, Ticket, Search,
    Settings, LogOut, Moon, X
} from 'lucide-react-native';
import { FontAwesome } from '@expo/vector-icons'; // Import for fallback avatar icon
import { useAuth } from '@/contexts/AuthContext'; // Correct path to AuthContext

interface NavigationDrawerProps {
  visible: boolean;
  onClose: () => void;
}

// --- Helper Function for Avatar ---
// (Similar to profile screen, adapted for this component)
const renderAvatar = (name: string | undefined, size: number = styles.avatar.width) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    // TODO: Replace null with user?.avatarUrl if your User object has an avatar field
    const avatarUrl = null;

    if (avatarUrl) {
        // Use Image if a real URL exists
        return <Image source={{ uri: avatarUrl }} style={[styles.avatar, { width: size, height: size }]} />;
    }
    // Fallback placeholder
    return (
        <View style={[styles.avatarPlaceholder, { width: size, height: size }]}>
            <FontAwesome name="user" size={size * 0.5} color="#64748b" />
            {/* Or Initials: <Text style={styles.avatarText}>{initial}</Text> */}
        </View>
    );
};

// --- Main Component ---
export default function NavigationDrawer({ visible, onClose }: NavigationDrawerProps) {
  const router = useRouter();
  const { user, logout } = useAuth(); // Get user and logout from context
  const [isDarkMode, setIsDarkMode] = useState(false); // Keep dark mode state

  const menuItems = [
    // Keep menu items definition the same
    { icon: <Home size={24} color="#1e293b" />, title: 'Accueil', route: '/' },
    { icon: <Award size={24} color="#1e293b" />, title: 'Certificats', route: '/(pages)/certificates' },
    { icon: <GraduationCap size={24} color="#1e293b" />, title: 'Cours', route: '/(pages)/cours' },
    { icon: <ClipboardList size={24} color="#1e293b" />, title: 'Inscriptions', route: '/(pages)/enrollments' },
    { icon: <Building2 size={24} color="#1e293b" />, title: 'Entreprises', route: '/(pages)/enterprises' },
    { icon: <Calendar size={24} color="#1e293b" />, title: 'Événements', route: '/(pages)/event' },
    { icon: <MessageSquare size={24} color="#1e293b" />, title: 'Messages', route: '/(tabs)/messages' },
    { icon: <Newspaper size={24} color="#1e293b" />, title: 'Actualités', route: '/(pages)/news' },
    { icon: <CreditCard size={24} color="#1e293b" />, title: 'Paiements', route: '/(pages)/payments' },
    { icon: <Tool size={24} color="#1e293b" />, title: 'Sessions Pratiques', route: '/(pages)/practicalSessions' },
    { icon: <Ticket size={24} color="#1e293b" />, title: 'Abonnements', route: '/(pages)/subscriptions' },
    { icon: <Search size={24} color="#1e293b" />, title: 'Recherche', route: '/(tabs)' }, // Consider if this route is correct
  ];

  const handleLogout = async () => {
        // Add Alert confirmation for logout
        Alert.alert(
            "Confirm Logout",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await logout();
                            onClose(); // Close drawer after logout initiated
                        } catch (error) {
                            console.error("Logout failed from drawer:", error);
                            Alert.alert("Logout Error", "Could not log out.");
                        }
                    }
                }
            ]
        );
    };


  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide" // Or "fade", "none"
      onRequestClose={onClose} // Handles Android back button press
    >
      <View style={styles.modalContainer}>
        {/* Overlay takes up space behind drawer, closes drawer on press */}
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />

        {/* The actual Drawer content */}
        <View style={styles.drawer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>

            {/* --- Profile Section - Updated --- */}
            <View style={styles.profile}>
              {/* Use renderAvatar helper with user's name */}
              {renderAvatar(user?.username, 80)}
              {/* Use user's name from context, provide fallback */}
              <Text style={styles.name} numberOfLines={1}>{user?.username ?? 'User Name'}</Text>
              {/* Use user's email from context, provide fallback */}
              <Text style={styles.email} numberOfLines={1}>{user?.email ?? 'user@example.com'}</Text>
            </View>
            {/* --- End Profile Section --- */}


            <ScrollView style={styles.menuScrollView} showsVerticalScrollIndicator={false}>
              {/* Menu Items */}
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => {
                    // Use router.push for navigation
                    // Type assertion needed because route strings might not match expected type exactly
                    router.push(item.route as any);
                    onClose(); // Close drawer after navigation
                  }}
                >
                  {/* Render icon directly */}
                  {item.icon}
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </TouchableOpacity>
              ))}

              {/* Theme Toggle */}
              <View style={styles.themeToggle}>
                <View style={styles.themeToggleContent}>
                  <Moon size={24} color="#1e293b" />
                  <Text style={styles.themeToggleText}>Thème sombre</Text>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={setIsDarkMode}
                  trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
                  thumbColor={isDarkMode ? '#2563eb' : '#f1f5f9'}
                  // Add iOS specific background color if needed
                  // ios_backgroundColor="#3e3e3e"
                />
              </View>
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.footerItem}
                onPress={() => {
                  // TODO: Define a proper route for settings
                  // router.push('/(pages)/settings' as any); // Example route
                  console.log("Settings pressed - implement route");
                  onClose();
                }}
              >
                <Settings size={24} color="#1e293b" />
                <Text style={styles.footerItemText}>Paramètres</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.footerItem, styles.signOut]}
                onPress={handleLogout} // Call the confirmation handler
              >
                <LogOut size={24} color="#ef4444" />
                <Text style={[styles.footerItemText, styles.signOutText]}>Déconnexion</Text>
              </TouchableOpacity>
            </View>
        </View>
      </View>
    </Modal>
  );
}

// --- Styles (Corrected for Left Slide-in Drawer) ---
const styles = StyleSheet.create({
  modalContainer: { // Container for the whole modal overlay and drawer
      flex: 1,
      // No flexDirection here, overlay sits behind drawer
  },
  overlay: {
      ...StyleSheet.absoluteFillObject, // Cover entire screen
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1, // Ensure overlay is behind drawer but clickable
  },
  drawer: {
      position: 'absolute', // Position absolutely within the modal container
      top: 0,
      bottom: 0,
      left: 0, // ** Explicitly position from the left **
      width: Platform.OS === 'web' ? 320 : '80%', // Drawer width
      maxWidth: 350, // Max width on larger screens
      backgroundColor: '#fff',
      zIndex: 2, // Ensure drawer is above overlay
      // Shadow/Elevation for visual separation
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 }, // Shadow appears on the right
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 10, // Android shadow
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'flex-end', // Align close button to the right
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#e2e8f0',
      // Add safe area padding if needed, especially on iOS Notch devices
      // paddingTop: Platform.OS === 'ios' ? 40 : 8, // Example
  },
  closeButton: {
      padding: 8, // Make easier to tap
  },
  profile: {
      alignItems: 'center',
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#e2e8f0',
  },
  avatar: { // Style for actual Image
      width: 80,
      height: 80,
      borderRadius: 40,
      marginBottom: 12,
      backgroundColor: '#e2e8f0',
  },
  avatarPlaceholder: { // Style for fallback View
      width: 80,
      height: 80,
      borderRadius: 40,
      marginBottom: 12,
      backgroundColor: '#e2e8f0',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#cbd5e1',
  },
  avatarText: { // Style for initials inside placeholder
      color: '#64748b',
      fontWeight: 'bold',
      fontSize: 28,
  },
  name: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: 4,
  },
  email: {
      fontSize: 14,
      color: '#64748b',
  },
  menuScrollView: {
      flex: 1, // Takes available vertical space
  },
  menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
  },
  menuItemText: {
      fontSize: 16,
      color: '#334155',
      marginLeft: 20,
  },
  themeToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderTopWidth: 1,
      borderTopColor: '#e2e8f0',
      marginTop: 8,
  },
  themeToggleContent: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  themeToggleText: {
      fontSize: 16,
      color: '#334155',
      marginLeft: 20,
  },
  footer: {
      borderTopWidth: 1,
      borderTopColor: '#e2e8f0',
      paddingBottom: Platform.OS === 'ios' ? 20 : 10, // Add padding at bottom
  },
  footerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
  },
  footerItemText: {
      fontSize: 16,
      color: '#334155',
      marginLeft: 20,
  },
  signOut: {
      // No special border needed now
  },
  signOutText: {
      color: '#ef4444', // Red text for sign out
  },
});
