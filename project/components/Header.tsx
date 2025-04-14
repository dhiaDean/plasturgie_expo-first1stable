import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Menu, Bell, User, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import NotificationsDropdown from './NotificationsDropdown';
import NavigationDrawer from './NavigationDrawer';

// Color constants for consistent theming
const COLORS = {
  primary: '#1e293b',
  background: '#ffffff',
  border: '#e2e8f0',
  hover: '#f1f5f9',
  placeholder: '#94a3b8',
};

export default function Header() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Toggle handlers
  const toggleDrawer = () => setShowDrawer(prev => !prev);
  const toggleNotifications = () => setShowNotifications(prev => !prev);
  const navigateToProfile = () => router.push('/profile');

  return (
    <View style={styles.header}>
      {/* Right-side Actions */}
      <View style={styles.actionGroup}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={toggleDrawer}
          activeOpacity={0.7}
        >
          <Menu size={24} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.placeholder} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for trainings ..."
            placeholderTextColor={COLORS.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={toggleNotifications}
          activeOpacity={0.7}
        >
          <Bell size={24} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={navigateToProfile}
          activeOpacity={0.7}
        >
          <User size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Conditional Components */}
      {showNotifications && (
        <NotificationsDropdown onClose={() => setShowNotifications(false)} />
      )}
      <NavigationDrawer
        visible={showDrawer}
        onClose={() => setShowDrawer(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10, // Further reduced from 15
    paddingTop: Platform.OS === 'web' ? 10 : 40, // Further reduced from 15/50
    paddingBottom: 10, // Further reduced from 15
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchContainer: {
    flex: 3, // Increased from 2 to make it even longer
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 8, // Slightly reduced from 10
    marginHorizontal: 8, // Slightly reduced from 10
  },
  searchIcon: {
    marginRight: 6, // Slightly reduced from 8
  },
  searchInput: {
    flex: 1,
    height: 40, 
    fontSize: 16,
    color: COLORS.primary,
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 10, // Reduced from 12
    alignItems: 'center',
    justifyContent: 'center', // Added to ensure centering of icons
    flex: 1, // Ensures actionGroup takes available space and centers properly
  },
  iconButton: {
    padding: 6, // Reduced from 8 to fit smaller header
    borderRadius: 6, // Adjusted from 8
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' && {
      transitionDuration: '200ms',
      ':hover': {
        backgroundColor: COLORS.hover,
      },
    }),
  },
});