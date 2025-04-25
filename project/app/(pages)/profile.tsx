import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Alert,
    ActivityIndicator, // Import ActivityIndicator
    RefreshControl, // Import RefreshControl
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { apiService } from '../services/api.service'; // Import apiService
import { Enrollment, Certification, Course } from '../services/api.types'; // Import types
import { FontAwesome } from '@expo/vector-icons'; // For avatar fallback

// --- Helper Functions (Keep or modify as needed) ---
const renderAvatar = (name: string | undefined, size: number = styles.avatar.width) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    const avatarUrl = null; // Replace with user.avatarUrl if available

    if (avatarUrl) {
        return <Image source={{ uri: avatarUrl }} style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} />;
    }
    return (
        <View style={[styles.avatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }]}>
            <FontAwesome name="user" size={size * 0.5} color="#64748b" />
        </View>
    );
};

const formatDateSimple = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { return 'Error'; }
};

// --- Main Component ---
export default function ProfileScreen() {
    const { user, logout, isAuthenticated } = useAuth(); // Get user, logout, and auth status

    // --- State for fetched data ---
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [courses, setCourses] = useState<Record<number, Course>>({}); // Store course details by ID
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);
    const [isLoadingCerts, setIsLoadingCerts] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // --- Data Fetching Logic ---
    const fetchData = useCallback(async () => {
        if (!isAuthenticated || !user) {
            console.log("Not authenticated, skipping profile data fetch.");
            setEnrollments([]); // Clear data if user logs out
            setCertifications([]);
            setCourses({});
            return;
        }
        console.log("Fetching profile data...");
        setError(null); // Clear previous errors
        setIsLoadingEnrollments(true);
        setIsLoadingCerts(true);

        try {
            // Fetch enrollments and certifications concurrently
            const [enrollmentData, certificationData] = await Promise.all([
                apiService.getUserEnrollments(),
                apiService.getUserCertifications()
            ]);

            setEnrollments(enrollmentData || []); // Handle null response if API returns that
            setCertifications(certificationData || []);

            // --- Fetch course details for enrollments/certs ---
            // Create a unique set of course IDs needed
            const courseIds = new Set<number>();
            (enrollmentData || []).forEach(e => e.courseId && courseIds.add(e.courseId));
            (certificationData || []).forEach(c => c.courseId && courseIds.add(c.courseId));

            if (courseIds.size > 0) {
                 console.log("Fetching course details for IDs:", Array.from(courseIds));
                const coursePromises = Array.from(courseIds).map(id =>
                    apiService.getCourseById(id).catch(err => {
                        console.warn(`Failed to fetch course ${id}:`, err);
                        return null; // Return null on error for specific course
                    })
                );
                const courseResults = await Promise.all(coursePromises);
                const courseMap: Record<number, Course> = {};
                courseResults.forEach(course => {
                    if (course?.courseId) {
                        courseMap[course.courseId] = course;
                    }
                });
                setCourses(courseMap);
                 console.log("Fetched course details:", courseMap);
            } else {
                 setCourses({}); // Reset courses if no IDs found
            }


        } catch (err: any) {
            console.error("Failed to fetch profile data:", err);
            const message = err?.response?.data?.message || err?.message || "Failed to load profile data.";
            setError(message);
            Alert.alert("Error", message);
        } finally {
            setIsLoadingEnrollments(false);
            setIsLoadingCerts(false);
        }
    }, [isAuthenticated, user]); // Dependency: only refetch if auth status or user changes

    // --- Initial Fetch and Refresh ---
    useEffect(() => {
        fetchData(); // Fetch data on initial mount or when auth changes
    }, [fetchData]); // Use the memoized fetchData function

    const onRefresh = useCallback(async () => {
        console.log("Refreshing profile data...");
        setIsRefreshing(true);
        await fetchData();
        setIsRefreshing(false);
    }, [fetchData]);

    // --- Logout Handler ---
    const handleLogout = async () => {
        try {
            await logout();
            console.log("Logout initiated from ProfileScreen");
        } catch (error) {
            console.error("Logout failed unexpectedly:", error);
            Alert.alert("Logout Error", "Could not log out. Please try again.");
        }
    };

    // --- Render Helper for List Items ---
    const renderEnrollmentItem = (item: Enrollment) => (
        <View key={`enrol-${item.id}`} style={styles.listItem}>
            <Text style={styles.listItemTitle}>{courses[item.courseId]?.title ?? `Course ID: ${item.courseId}`}</Text>
            <Text style={styles.listItemSubtitle}>Enrolled: {formatDateSimple(item.enrollmentDate)} - Status: {item.status}</Text>
        </View>
    );

    const renderCertificateItem = (item: Certification) => (
         <View key={`cert-${item.id ?? item.certificationId}`} style={styles.listItem}>
            <Text style={styles.listItemTitle}>{courses[item.courseId]?.title ?? `Course ID: ${item.courseId}`}</Text>
            <Text style={styles.listItemSubtitle}>Issued: {formatDateSimple(item.issueDate ?? item.certificationDate)} - Status: {item.status}</Text>
             
             
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                refreshControl={ // Add pull-to-refresh
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#64748b"/>
                }
            >
                {/* Header Section */}
                <View style={styles.header}>
                    {renderAvatar(user?.username)}
                    <Text style={styles.name}>{user?.username ?? 'Loading...'}</Text>
                    <Text style={styles.email}>{user?.email ?? 'Loading...'}</Text>
                    {user?.role && (
                        <Text style={styles.role}>Role: {user.role.replace('ROLE_', '').replace('_', ' ')}</Text>
                    )}
                </View>

                {/* Content Sections */}
                <View style={styles.contentPadding}>
                    {/* Formations Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mes formations</Text>
                        {isLoadingEnrollments ? (
                            <ActivityIndicator size="small" color="#64748b" />
                        ) : error && !enrollments.length ? ( // Show error only if loading finished and no data shown
                            <Text style={styles.errorText}>Could not load formations.</Text>
                        ) : enrollments.length > 0 ? (
                            enrollments.map(renderEnrollmentItem)
                        ) : (
                            <Text style={styles.sectionContent}>Vous n'avez pas encore de formations en cours.</Text>
                        )}
                    </View>

                    {/* Certificats Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mes certificats</Text>
                         {isLoadingCerts ? (
                            <ActivityIndicator size="small" color="#64748b" />
                        ) : error && !certifications.length ? (
                            <Text style={styles.errorText}>Could not load certificates.</Text>
                        ) : certifications.length > 0 ? (
                            certifications.map(renderCertificateItem)
                        ) : (
                            <Text style={styles.sectionContent}>Aucun certificat obtenu pour le moment.</Text>
                        )}
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                    >
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    container: {
        flex: 1,
    },
    header: {
        backgroundColor: '#ffffff',
        paddingVertical: 24,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    avatar: { // Style for actual Image
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        backgroundColor: '#e2e8f0',
    },
    avatarPlaceholder: { // Style for the fallback View
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        backgroundColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#cbd5e1'
    },
    name: {
        fontSize: 22,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    email: {
        fontSize: 15,
        color: '#64748b',
    },
     role: {
        fontSize: 13,
        color: '#94a3b8',
        marginTop: 8,
        textTransform: 'capitalize',
    },
    contentPadding: {
        padding: 20,
    },
    section: {
        backgroundColor: '#ffffff',
        padding: 20,
        marginBottom: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 12,
    },
    sectionContent: { // Used for empty state text now
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        textAlign: 'center', // Center empty state text
        paddingVertical: 10, // Add some padding
    },
     // Styles for list items within sections
    listItem: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9', // Lighter separator
    },
    // Remove border from the last item in a list
    // Note: Applying this cleanly requires tracking index in map or using FlatList
    // For simplicity, we'll leave the border on the last item for now.
    // listItem:last-child { borderBottomWidth: 0 }, // CSS concept
    listItemTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#334155',
        marginBottom: 2,
    },
    listItemSubtitle: {
        fontSize: 13,
        color: '#64748b',
    },
    errorText: {
        fontSize: 14,
        color: '#dc2626', // Red error color
        textAlign: 'center',
        paddingVertical: 10,
    },
    logoutButton: {
        backgroundColor: '#fee2e2', // Light red background
        borderRadius: 8,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#fca5a5', // Red border
    },
    logoutButtonText: {
        color: '#b91c1c', // Dark red text
        fontSize: 16,
        fontWeight: 'bold',
    },
});