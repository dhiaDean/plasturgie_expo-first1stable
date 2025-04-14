import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { Award } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';


// Sample certificate data
const mockCertificates = [
  {
    id: '1',
    title: 'Introduction to Injection Molding',
    code: 'CERT-IM-2025-001',
    issuedDate: '15 Mars 2025',
  },
  {
    id: '2',
    title: 'Plastic Recycling Methods',
    code: 'CERT-PR-2025-002',
    issuedDate: '1 Mars 2025',
  },
];

export default function CertificatesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  // Mock state to demonstrate a switch between populated and empty state
  const [hasCertificates, setHasCertificates] = useState(true);

  // Calculate number of columns based on screen width
  const getColumnCount = () => {
    if (width < 640) return 1; // Mobile - 1 column
    if (width < 1024) return 2; // Tablet - 2 columns
    return 3; // Desktop - 3 columns
  };

  const columnCount = getColumnCount();

  // Mock download function
  const handleDownloadCertificate = (certificateId: string) => {
    console.log(`Downloading certificate ${certificateId}`);
    // In production, this would trigger a real download
  };

  return (
    <View style={styles.container}>
       
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {hasCertificates ? (
          <View style={[styles.certificatesGrid, { gap: 16 }]}>
            {mockCertificates.map((certificate) => (
              <View key={certificate.id} style={[
                styles.certificateCard,
                { width: columnCount === 1 ? '100%' : `${Math.floor(100 / columnCount) - 4}%` }
              ]}>
                <View style={styles.cardHeader}>
                  <Award size={20} color="#2563eb" />
                  <Text style={styles.cardTitle}>{certificate.title}</Text>
                </View>
                
                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Code:</Text>
                    <Text style={styles.detailValue}>{certificate.code}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date d'émission:</Text>
                    <Text style={styles.detailValue}>{certificate.issuedDate}</Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.downloadButton}
                  onPress={() => handleDownloadCertificate(certificate.id)}
                >
                  <Text style={styles.downloadButtonText}>Télécharger le certificat</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Award size={64} color="#94a3b8" />
            <Text style={styles.emptyStateTitle}>Aucun certificat disponible</Text>
            <Text style={styles.emptyStateDescription}>
              Suivez et réussissez des formations dans notre académie pour obtenir des certificats.
            </Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.push('/catalogue' as any)}
            >
              <Text style={styles.browseButtonText}>Parcourir les formations</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  certificatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  certificateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 8,
    flex: 1,
  },
  cardDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#1e293b',
  },
  downloadButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  browseButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
});