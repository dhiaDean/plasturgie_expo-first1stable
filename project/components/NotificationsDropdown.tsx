import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface NotificationsDropdownProps {
  onClose: () => void;
}

export default function NotificationsDropdown({ onClose }: NotificationsDropdownProps) {
  const notifications = [
    {
      id: 1,
      title: 'Nouvelle formation disponible',
      message: 'Une nouvelle formation sur la plasturgie vient d\'être ajoutée',
      time: 'Il y a 2 heures',
    },
    {
      id: 2,
      title: 'Rappel de cours',
      message: 'Votre prochain cours commence dans 1 heure',
      time: 'Il y a 5 heures',
    },
    {
      id: 3,
      title: 'Mise à jour du programme',
      message: 'Le programme de formation a été mis à jour',
      time: 'Il y a 1 jour',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.dropdown}>
        <Text style={styles.title}>Notifications</Text>
        <ScrollView style={styles.notificationsList}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={styles.notificationItem}
              onPress={onClose}
            >
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <TouchableOpacity style={styles.overlay} onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '100%',
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdown: {
    position: 'absolute',
    top: 0,
    right: 20,
    width: 320,
    maxHeight: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1e293b',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  notificationsList: {
    maxHeight: 350,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  notificationTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
  },
  notificationMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  notificationTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94a3b8',
  },
});