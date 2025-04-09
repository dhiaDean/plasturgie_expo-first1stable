import { View, Text, StyleSheet, Image } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>Balti Chef</Text>
        <Text style={styles.email}>balti.chef@example.com</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes formations</Text>
        <Text style={styles.sectionContent}>Vous n'avez pas encore de formations en cours.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes certificats</Text>
        <Text style={styles.sectionContent}>Aucun certificat obtenu pour le moment.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 4,
  },
  email: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748b',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 12,
  },
  sectionContent: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
  },
});