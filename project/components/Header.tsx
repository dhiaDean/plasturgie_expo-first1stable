import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Menu, Bell, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import NotificationsDropdown from './NotificationsDropdown';
import NavigationDrawer from './NavigationDrawer';

export default function Header() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  // Function to handle drawer toggle
  const toggleDrawer = () => setShowDrawer(!showDrawer);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={toggleDrawer}
        style={styles.iconButton}
      >
        <Menu size={24} color="#1e293b" />
      </TouchableOpacity>

      <View style={styles.rightIcons}>
        <TouchableOpacity
          onPress={() => setShowNotifications(!showNotifications)}
          style={styles.iconButton}
        >
          <Bell size={24} color="#1e293b" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/profile')}
          style={styles.iconButton}
        >
          <User size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      {showNotifications && (
        <NotificationsDropdown onClose={() => setShowNotifications(false)} />
      )}

      {/* Using Modal inside NavigationDrawer ensures proper z-index handling */}
      <NavigationDrawer visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 8,
  },
});