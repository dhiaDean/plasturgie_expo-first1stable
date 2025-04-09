import React from 'react'; // Add this line
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Switch, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Chrome as Home, Book, Award, GraduationCap, ClipboardList, Building2, Calendar, MessageSquare, Newspaper, CreditCard, PenTool as Tool, Ticket, Search, Settings, LogOut, Moon, X } from 'lucide-react-native';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export default function NavigationDrawer({ visible, onClose }: NavigationDrawerProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const menuItems = [
    { icon: <Home size={24} color="#1e293b" />, title: 'Accueil', route: '/' },
    { icon: <Book size={24} color="#1e293b" />, title: 'Catalogue', route: '/catalogue' },
    { icon: <Award size={24} color="#1e293b" />, title: 'Certificats', route: '/certificates' },
    { icon: <GraduationCap size={24} color="#1e293b" />, title: 'Cours', route: '/courses' },
    { icon: <ClipboardList size={24} color="#1e293b" />, title: 'Inscriptions', route: '/enrollments' },
    { icon: <Building2 size={24} color="#1e293b" />, title: 'Entreprises', route: '/enterprises' },
    { icon: <Calendar size={24} color="#1e293b" />, title: 'Événements', route: '/events' },
    { icon: <MessageSquare size={24} color="#1e293b" />, title: 'Messages', route: '/messages' },
    { icon: <Newspaper size={24} color="#1e293b" />, title: 'Actualités', route: '/news' },
    { icon: <CreditCard size={24} color="#1e293b" />, title: 'Paiements', route: '/payments' },
    { icon: <Tool size={24} color="#1e293b" />, title: 'Sessions Pratiques', route: '/practical-sessions' },
    { icon: <Ticket size={24} color="#1e293b" />, title: 'Abonnements', route: '/subscriptions' },
    { icon: <Search size={24} color="#1e293b" />, title: 'Recherche', route: '/search' },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
        <View style={styles.drawer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#1e293b" />
          </TouchableOpacity>
        </View>

        <View style={styles.profile}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>Balti Chef</Text>
          <Text style={styles.email}>balti.chef@example.com</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => {
                router.push(item.route as any); //add as nay to remove the red
                onClose();
              }}
            >
              {item.icon}
              <Text style={styles.menuItemText}>{item.title}</Text>
            </TouchableOpacity>
          ))}

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
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => {
              router.push('/settings' as any) ;//add as any to remove the red
              onClose();
            }}
          >
            <Settings size={24} color="#1e293b" />
            <Text style={styles.footerItemText}>Paramètres</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.footerItem, styles.signOut]}
            onPress={() => {
              // Call logout function from AuthContext
              logout();
              // No need to manually navigate as AuthContext will handle it
              onClose();
            }}
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 10,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9998,
    elevation: 9,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: Platform.OS === 'web' ? 320 : '80%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    zIndex: 9999,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeButton: {
    padding: 8,
  },
  profile: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 4,
  },
  email: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
  },
  content: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  menuItemText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 16,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  themeToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggleText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  footerItemText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 16,
  },
  signOut: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: '#ef4444',
  },
});