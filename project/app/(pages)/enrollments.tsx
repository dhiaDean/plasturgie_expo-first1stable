import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity, // Keep if you add actions to items
    ScrollView,
    useWindowDimensions,
    Platform,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    Alert,
} from 'react-native';
import { ClipboardList, BookOpen } from 'lucide-react-native'; // Using ClipboardList as primary icon
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '../services/api.service'; // Adjust path if necessary
import { Enrollment, Course } from '../services/api.types'; // Adjust path if necessary

// Helper to format date
const formatDateSimple = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return 'Error'; }
};

// --- Main Component ---
export default function EnrollmentsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions(); // For potential responsive layout
  const { user, isAuthenticated, token } = useAuth();

  // --- State for fetched data ---
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Record<number, Course>>({}); // Store course details by ID
  const [isLoading, setIsLoading] = useState(true); // Initial loading state
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- Data Fetching Logic ---
  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !user || !token) {
        console.log("EnrollmentsScreen: Not authenticated, skipping data fetch.");
        setEnrollments([]);
        setCourses({});
        setIsLoading(false);
        setIsRefreshing(false);
        return;
    }
    console.log("EnrollmentsScreen: Fetching enrollments for user:", user.id);
    setError(null);
    if (!isRefreshing) setIsLoading(true);

    try {
        apiService.setToken(token); // Ensure service has current token
        const enrollmentData = await apiService.getUserEnrollments();
        setEnrollments(enrollmentData || []);

        // --- Fetch course details for enrollments ---
        const courseIds = new Set<number>();
        (enrollmentData || []).forEach(e => e.courseId && courseIds.add(e.courseId));

        if (courseIds.size > 0) {
            console.log("EnrollmentsScreen: Fetching course details for IDs:", Array.from(courseIds));
            const coursePromises = Array.from(courseIds).map(id =>
                apiService.getCourseById(id).catch(err => {
                    console.warn(`EnrollmentsScreen: Failed to fetch course ${id}:`, err.message);
                    return null;
                })
            );
            const courseResults = await Promise.all(coursePromises);
            const courseMap: Record<number, Course> = {};
            courseResults.forEach(course => {
                if (course?.courseId) courseMap[course.courseId] = course;
            });
            setCourses(courseMap);
            console.log("EnrollmentsScreen: Fetched course details count:", Object.keys(courseMap).length);
        } else {
            setCourses({});
        }
    } catch (err: any) {
        console.error("EnrollmentsScreen: Failed to fetch data:", err);
        const message = err?.response?.data?.message || err?.message || "Failed to load enrollments.";
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
        setEnrollments([]);
        setCourses({});
        if (!isAuthenticated && !isLoading) setIsLoading(false);
    }
  }, [fetchData, isAuthenticated, user, token, isLoading]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
  }, [fetchData]);

  // Calculate number of columns (optional for this list view, but kept for consistency)
  const getColumnCount = () => {
    if (width < 768) return 1; // Mobile/Small Tablet - 1 column
    return 2; // Larger Tablet/Web - 2 columns for cards (if using card layout)
  };
  const columnCount = getColumnCount();

  // --- Render Logic ---
  if (isLoading && enrollments.length === 0) {
    return (
        <SafeAreaView style={[styles.container, styles.centerContainer]}>
            <ActivityIndicator size="large" color={styles.colorAccent.color} />
            <Text style={styles.loadingText}>Loading Enrollments...</Text>
        </SafeAreaView>
    );
  }

  // --- Render Enrollment Item ---
  const renderEnrollmentCard = (enrollment: Enrollment) => {
    const courseTitle = courses[enrollment.courseId]?.title || "Course details unavailable";
    const courseCategory = courses[enrollment.courseId]?.category || "N/A";

    return (
        <View
            key={enrollment.id ?? enrollment.enrollmentId}
            style={[
                styles.enrollmentCard,
                // Example for multi-column layout if desired for web/tablet:
                // { width: columnCount === 1 ? '100%' : `${Math.floor(100 / columnCount) - (columnCount > 1 ? 2 : 0)}%` }
            ]}
        >
            <View style={styles.cardHeader}>
                <BookOpen size={20} color={styles.colorAccent.color} />
                <Text style={styles.cardTitle} numberOfLines={2}>{courseTitle}</Text>
            </View>

            <View style={styles.cardDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category:</Text>
                  <Text style={styles.detailValue}>{courseCategory}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Enrollment Date:</Text>
                  <Text style={styles.detailValue}>{formatDateSimple(enrollment.enrollmentDate)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={[styles.detailValue, getStatusStyle(enrollment.status)]}>{enrollment.status}</Text>
                </View>
                {enrollment.completionDate && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Completion Date:</Text>
                        <Text style={styles.detailValue}>{formatDateSimple(enrollment.completionDate)}</Text>
                    </View>
                )}
            </View>
            {/* Optional: Add action button e.g., "View Course" */}
            {/*
            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push(`/(pages)/cours/${enrollment.courseId}` as any)}
            >
                <Text style={styles.actionButtonText}>View Course</Text>
            </TouchableOpacity>
            */}
        </View>
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageTitle}>My Enrollments</Text>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={styles.colorSecondaryText.color} />
        }
      >
        {error && !isLoading && (
            <View style={styles.errorBox}>
                <Text style={styles.errorTextMsg}>Error: {error}</Text>
                <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        )}

        {!isLoading && !error && enrollments.length === 0 && (
          <View style={styles.emptyState}>
            <ClipboardList size={64} color={styles.colorMutedText.color} />
            <Text style={styles.emptyStateTitle}>No Enrollments Found</Text>
            <Text style={styles.emptyStateDescription}>
              You are not currently enrolled in any courses. Explore our catalog to find your next learning opportunity!
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/(pages)/cours' as any)} // Navigate to general courses page
            >
              <Text style={styles.browseButtonText}>Browse Courses</Text>
            </TouchableOpacity>
          </View>
        )}

        {!error && enrollments.length > 0 && (
          <View style={[
                styles.enrollmentsList,
                // Apply grid styles if columnCount > 1
                // columnCount > 1 && { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'}
            ]}>
            {enrollments.map(renderEnrollmentCard)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function for status text color
const getStatusStyle = (status: Enrollment['status']) => {
    switch(status) {
        case 'ACTIVE': return { color: '#16a34a' }; // Green
        case 'PENDING': return { color: '#ca8a04' }; // Yellow/Amber
        case 'COMPLETED': return { color: '#1e40af' }; // Blue
        case 'CANCELLED': return { color: '#7f1d1d'}; // Darker Red
        default: return {};
    }
};

// --- Styles ---
const styles = StyleSheet.create({
    // Core Colors (reused theme)
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
    centerContainer: {
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
        paddingTop: Platform.OS === 'android' ? 20 : 10,
        paddingBottom: 10,
        backgroundColor: '#ffffff', // Give title a solid background
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    enrollmentsList: {
        // Styles for the container of all enrollment cards
    },
    enrollmentCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1, },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1e293b',
        marginLeft: 10,
        flex: 1,
    },
    cardDetails: {
        marginBottom: 8, // Reduced margin if no action button
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5, // Increased padding
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
    },
    detailValue: {
        fontSize: 14,
        color: '#334155',
        flexShrink: 1,
        textAlign: 'right',
    },
    actionButton: { // Optional button style
        backgroundColor: '#e0e7ff',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#a5b4fc',
    },
    actionButtonText: {
        color: '#3730a3',
        fontWeight: '500',
        fontSize: 14,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        marginTop: 30,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1e293b',
        marginTop: 20,
        marginBottom: 10,
    },
    emptyStateDescription: {
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
        fontWeight: '500',
        fontSize: 16,
    },
    // Error Box Styles
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