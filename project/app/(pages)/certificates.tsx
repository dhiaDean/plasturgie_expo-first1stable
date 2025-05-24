import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView, // Keep for overall page scroll if needed, or FlatList for grid
    useWindowDimensions,
    Platform,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView, // Add SafeAreaView
    Alert,
} from 'react-native';
import { Award, FileText, Download } from 'lucide-react-native'; // Import additional icons
import { useRouter } from 'expo-router';
// Removed Header import, as it's not used in this version. Add back if needed.

import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { apiService } from '../services/api.service'; // Adjust path if necessary
import { Certification, Course } from '../services/api.types'; // Adjust path if necessary

// Helper to format date
const formatDateSimple = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return 'Error'; }
};


export default function CertificatesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user, isAuthenticated, token } = useAuth(); // Get auth state

  // --- State for fetched data ---
  const [certificates, setCertificates] = useState<Certification[]>([]);
  const [courses, setCourses] = useState<Record<number, Course>>({}); // Store course details by ID
  const [isLoading, setIsLoading] = useState(true); // Initial loading state
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);


  // --- Data Fetching Logic ---
  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !user || !token) {
        console.log("CertificatesScreen: Not authenticated, skipping data fetch.");
        setCertificates([]);
        setCourses({});
        setIsLoading(false);
        setIsRefreshing(false);
        return;
    }
    console.log("CertificatesScreen: Fetching certificates for user:", user.id);
    setError(null);
    // Set loading true only if not already refreshing
    if (!isRefreshing) setIsLoading(true);

    try {
        apiService.setToken(token); // Ensure service has the current token
        const certificationData = await apiService.getUserCertifications();
        setCertificates(certificationData || []);

        // --- Fetch course details for certifications ---
        const courseIds = new Set<number>();
        (certificationData || []).forEach(c => c.courseId && courseIds.add(c.courseId));

        if (courseIds.size > 0) {
            console.log("CertificatesScreen: Fetching course details for IDs:", Array.from(courseIds));
            const coursePromises = Array.from(courseIds).map(id =>
                apiService.getCourseById(id).catch(err => {
                    console.warn(`CertificatesScreen: Failed to fetch course ${id}:`, err.message);
                    return null;
                })
            );
            const courseResults = await Promise.all(coursePromises);
            const courseMap: Record<number, Course> = {};
            courseResults.forEach(course => {
                if (course?.courseId) courseMap[course.courseId] = course;
            });
            setCourses(courseMap);
            console.log("CertificatesScreen: Fetched course details count:", Object.keys(courseMap).length);
        } else {
            setCourses({});
        }
    } catch (err: any) {
        console.error("CertificatesScreen: Failed to fetch data:", err);
        const message = err?.response?.data?.message || err?.message || "Failed to load certificates.";
        setError(message);
    } finally {
        setIsLoading(false);
        setIsRefreshing(false);
    }
  }, [isAuthenticated, user, token, isRefreshing]); // Dependencies

  // --- Initial Fetch & Refresh Control ---
  useEffect(() => {
    if (isAuthenticated && user && token) {
        fetchData();
    } else {
        // Clear data if user logs out or isn't initially loaded
        setCertificates([]);
        setCourses({});
        if (!isAuthenticated && !isLoading) { // If not loading and not auth, set loading false
            setIsLoading(false);
        }
    }
  }, [fetchData, isAuthenticated, user, token, isLoading]); // Add isLoading to dependencies

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
  }, [fetchData]);

  // Calculate number of columns (remains the same)
  const getColumnCount = () => {
    if (width < 640) return 1;
    if (width < 1024) return 2;
    return 3;
  };
  const columnCount = getColumnCount();

  // Handle Download (Placeholder for actual download logic)
  const handleDownloadCertificate = (certificateId: number | string | undefined, certificateCode: string | undefined) => {
    if (!certificateId && !certificateCode) {
        Alert.alert("Error", "Certificate information is missing.");
        return;
    }
    console.log(`Downloading certificate ID: ${certificateId}, Code: ${certificateCode}`);
    Alert.alert("Download", `Simulating download for certificate: ${certificateCode || certificateId}`);
    // TODO: Implement actual download (e.g., open a URL, trigger a file download API)
  };


  // --- Render Logic ---
  if (isLoading && certificates.length === 0) { // Show full screen loader only on initial empty load
    return (
        <SafeAreaView style={[styles.container, styles.centerContainer]}>
            <ActivityIndicator size="large" color={styles.colorAccent.color} />
            <Text style={styles.loadingText}>Loading Certificates...</Text>
        </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Consider adding a page header component here if needed */}
      {/* <Header title="Mes Certificats" /> */}
      <Text style={styles.pageTitle}>Mes Certificats</Text>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={styles.colorSecondaryText.color} />
        }
      >
        {error && !isLoading && ( // Show error if loading finished and error exists
            <View style={styles.errorBox}>
                <Text style={styles.errorTextMsg}>Error: {error}</Text>
                <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        )}

        {!isLoading && !error && certificates.length === 0 && (
          <View style={styles.emptyState}>
            <Award size={64} color={styles.colorMutedText.color} />
            <Text style={styles.emptyStateTitle}>Aucun certificat disponible</Text>
            <Text style={styles.emptyStateDescription}>
              Suivez et réussissez des formations dans notre académie pour obtenir des certificats.
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/(pages)/cours' as any)} // Navigate to courses page
            >
              <Text style={styles.browseButtonText}>Parcourir les formations</Text>
            </TouchableOpacity>
          </View>
        )}

        {!error && certificates.length > 0 && (
          <View style={[styles.certificatesGrid, { gap: 16 }]}>
            {certificates.map((certificate) => {
              const courseTitle = courses[certificate.courseId]?.title || "Course details unavailable";
              return (
                <View key={certificate.id ?? certificate.certificationId} style={[
                  styles.certificateCard,
                  { width: columnCount === 1 ? '100%' : `${Math.floor(100 / (columnCount > 1 ? columnCount : 1)) - (columnCount > 1 ? 2 : 0)}%` } // Defensive coding for columnCount
                ]}>
                  <View style={styles.cardHeader}>
                    <Award size={20} color={styles.colorAccent.color} />
                    <Text style={styles.cardTitle} numberOfLines={2}>{courseTitle}</Text>
                  </View>

                  <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Code:</Text>
                      <Text style={styles.detailValue}>{certificate.certificateCode || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date d'émission:</Text>
                      <Text style={styles.detailValue}>{formatDateSimple(certificate.issueDate ?? certificate.certificationDate)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Statut:</Text>
                      <Text style={[styles.detailValue, getStatusStyle(certificate.status)]}>{certificate.status}</Text>
                    </View>
                    { (certificate.expiryDate || certificate.expirationDate) && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Expire le:</Text>
                            <Text style={styles.detailValue}>{formatDateSimple(certificate.expiryDate ?? certificate.expirationDate)}</Text>
                        </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => handleDownloadCertificate(certificate.id ?? certificate.certificationId, certificate.certificateCode)}
                  >
                    <Download size={16} color="#fff" style={{ marginRight: 8 }}/>
                    <Text style={styles.downloadButtonText}>Télécharger</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function for status text color
const getStatusStyle = (status: Certification['status']) => {
    switch(status) {
        case 'APPROVED': return { color: '#16a34a' }; // Green
        case 'PENDING': return { color: '#ca8a04' }; // Yellow/Amber
        case 'EXPIRED': return { color: '#dc2626' }; // Red
        case 'REJECTED': return { color: '#7f1d1d'}; // Darker Red
        default: return {};
    }
};

// --- Styles (Adapted from previous files) ---
const styles = StyleSheet.create({
    // Core Colors
    colorPrimaryText: { color: '#1e293b' },
    colorSecondaryText: { color: '#64748b' },
    colorMutedText: { color: '#94a3b8' },
    colorBackground: { backgroundColor: '#f8fafc' },
    colorCardBackground: { backgroundColor: '#ffffff' },
    colorBorder: { borderColor: '#e2e8f0' },
    colorAccent: { color: '#2563eb' },
    colorErrorText: { color: '#b91c1c'},

    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centerContainer: { // For full screen loading
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#64748b',
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 20 : 10, // Add some top padding
        paddingBottom: 10,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingTop: 0, // Title has padding
    },
    certificatesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between', // For multi-column layout
        // If columnCount is 1, justifyContent should be 'flex-start' or remove it
    },
    certificateCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 16,
        marginBottom: 16, // Spacing between cards
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1, },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12, // Reduced margin
    },
    cardTitle: {
        // fontFamily: 'Inter-SemiBold', // Uncomment if font is loaded
        fontSize: 16,
        fontWeight: '600', // Use font weight
        color: '#1e293b',
        marginLeft: 10, // Increased margin from icon
        flex: 1, // Allow title to take space and wrap
    },
    cardDetails: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4, // Add vertical padding
    },
    detailLabel: {
        // fontFamily: 'Inter-Medium',
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
    },
    detailValue: {
        // fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#334155', // Slightly darker value text
        flexShrink: 1, // Allow value to shrink/wrap if label is long
        textAlign: 'right', // Align value to the right
    },
    downloadButton: {
        backgroundColor: '#2563eb', // Accent color
        borderRadius: 8,
        paddingVertical: 10, // Adjust padding
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row', // For icon and text
        marginTop: 8, // Space above button
    },
    downloadButtonText: {
        color: '#fff',
        // fontFamily: 'Inter-Medium',
        fontWeight: '500',
        fontSize: 14,
    },
    emptyState: {
        flex: 1, // Make empty state take available space if scrollview is also flex:1
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        marginTop: 30, // Add some margin from top
    },
    emptyStateTitle: {
        // fontFamily: 'Inter-SemiBold',
        fontSize: 20,
        fontWeight: '600',
        color: '#1e293b',
        marginTop: 20, // Increased margin
        marginBottom: 10,
    },
    emptyStateDescription: {
        // fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    browseButton: {
        backgroundColor: '#2563eb',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    browseButtonText: {
        color: '#fff',
        // fontFamily: 'Inter-Medium',
        fontWeight: '500',
        fontSize: 16,
    },
    // Error Box Styles (similar to ProfileScreen)
    errorBox: {
        backgroundColor: '#fee2e2',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fca5a5',
        marginBottom: 20,
        alignItems: 'center',
    },
    errorTextMsg: {
        fontSize: 14,
        color: '#b91c1c',
        textAlign: 'center',
        marginBottom: 10,
    },
    retryButton: {
        backgroundColor: '#ffffff',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#fca5a5',
    },
    retryButtonText: {
        color: '#b91c1c',
        fontWeight: '500',
    },
});
