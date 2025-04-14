import React, { useState, useEffect, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView, // Using ScrollView as the main container
    TouchableOpacity,
    SafeAreaView,
    Platform,
} from 'react-native';
// Import appropriate icons
import { Feather, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

// --- Data Structure ---
interface PracticalSession {
  id: number;
  title: string;
  trainingTitle: string; // Subtitle
  sessionDate: string; // ISO Date String
  location: string;
  tutorName: string;
  tutorAvatar?: string; // Optional avatar URL
  isFuture: boolean;
}

// --- Mock Session Data ---
const mockSessions: PracticalSession[] = [
  {
    id: 1,
    title: "Injection Molding Lab Session",
    trainingTitle: "Introduction to Injection Molding",
    sessionDate: "2025-04-15T14:00:00Z",
    location: "Lab 3, Building B, Polymer Campus",
    tutorName: "Dr. Anya Petrova",
    tutorAvatar: undefined,
    isFuture: true,
  },
  {
    id: 2,
    title: "Recycling Process Demonstration",
    trainingTitle: "Sustainable Plastics Management",
    sessionDate: "2025-04-18T10:30:00Z",
    location: "Recycling Center Demo Area",
    tutorName: "Mr. David Chen",
    tutorAvatar: undefined,
    isFuture: true,
  },
   {
    id: 3,
    title: "Extrusion Parameters Workshop",
    trainingTitle: "Advanced Extrusion Techniques",
    sessionDate: "2024-03-10T09:00:00Z",
    location: "Workshop Room 1, Tech Center",
    tutorName: "Prof. Kenji Tanaka",
    tutorAvatar: undefined,
    isFuture: false, // Past session
  },
    {
    id: 4,
    title: "Material Testing Basics",
    trainingTitle: "Fundamentals of Polymer Science",
    sessionDate: "2025-05-01T13:00:00Z",
    location: "Materials Lab A",
    tutorName: "Dr. Anya Petrova",
    tutorAvatar: undefined,
    isFuture: true,
  },
   {
    id: 5,
    title: "CAD for Mold Design",
    trainingTitle: "Design for Manufacturing",
    sessionDate: "2024-02-20T11:00:00Z",
    location: "CAD Suite, Engineering Hall",
    tutorName: "Ms. Chloe Dubois",
    tutorAvatar: undefined,
    isFuture: false, // Past session
  },
];

// --- Helper Functions ---

// Date Formatter (e.g., April 15, 2025)
const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
         if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString(undefined, { // Locale default formatting
             year: 'numeric', month: 'long', day: 'numeric'
        });
    } catch (e) { return 'Error'; }
};

// Time Formatter (e.g., 2:00 PM)
const formatTime = (dateString: string): string => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Time';
        return date.toLocaleTimeString(undefined, { // Locale default formatting
             hour: 'numeric', minute: '2-digit', hour12: true
        });
    } catch (e) { return 'Error'; }
};

// Status Badge Styling & Component
type SessionStatus = 'Upcoming' | 'Completed';
const getStatusBadgeStyle = (status: SessionStatus) => {
  switch (status) {
    case "Upcoming":
      return {
        backgroundColor: '#dbeafe', // blue-100
        textColor: '#1e40af',       // blue-800
        borderColor: '#bfdbfe',     // blue-200
      };
    case "Completed":
    default:
      return {
        backgroundColor: '#f3f4f6', // gray-100
        textColor: '#374151',       // gray-700
        borderColor: '#e5e7eb',     // gray-200
      };
  }
};

const StatusBadge: React.FC<{ status: SessionStatus }> = ({ status }) => {
     const styleInfo = getStatusBadgeStyle(status);
     return (
        <View style={[styles.badge, { backgroundColor: styleInfo.backgroundColor, borderColor: styleInfo.borderColor }]}>
            <Text style={[styles.badgeText, { color: styleInfo.textColor }]}>{status}</Text>
        </View>
     );
};

// Tutor Avatar Fallback
const renderTutorAvatar = (name: string, size: number = styles.tutorAvatar.width) => {
    const initial = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2) : '?';
    // In real app, check for an avatar URL first
    return (
        <View style={[styles.tutorAvatar, { width: size, height: size, borderRadius: size / 2 }]}>
            <FontAwesome name="user" size={size * 0.5} color="#64748b" />
            {/* Or Initials: <Text style={styles.tutorAvatarText}>{initial}</Text> */}
        </View>
    );
};


// --- Main Component ---
const PracticalSessionsScreen = () => {
    // Separate sessions into upcoming and past
    const upcomingSessions = useMemo(() => mockSessions.filter(s => s.isFuture), [mockSessions]);
    const pastSessions = useMemo(() => mockSessions.filter(s => !s.isFuture), [mockSessions]);

    // --- Button Handler ---
    const handleAddToCalendar = (session: PracticalSession) => {
        console.log('Add to Calendar Pressed for:', session.title);
        // Implement actual calendar logic here (e.g., using expo-calendar)
    };

    // --- Render Session Card ---
    const renderSessionCard = (session: PracticalSession, isPast: boolean = false) => {
        const status: SessionStatus = isPast ? 'Completed' : 'Upcoming';
        return (
            <View key={session.id} style={[styles.sessionCard, isPast && styles.pastSessionCard]}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.sessionTitle}>{session.title}</Text>
                        <Text style={styles.trainingTitle}>{session.trainingTitle}</Text>
                    </View>
                    <StatusBadge status={status} />
                </View>

                {/* Card Content */}
                <View style={styles.cardContent}>
                    {/* Date */}
                    <View style={styles.detailRow}>
                        <Feather name="calendar" size={16} color={styles.iconColor.color} style={styles.detailIcon} />
                        <Text style={styles.detailText}>{formatDate(session.sessionDate)}</Text>
                    </View>
                    {/* Time */}
                    <View style={styles.detailRow}>
                        <Feather name="clock" size={16} color={styles.iconColor.color} style={styles.detailIcon} />
                        <Text style={styles.detailText}>{formatTime(session.sessionDate)}</Text>
                    </View>
                    {/* Location */}
                    <View style={styles.detailRow}>
                        <Feather name="map-pin" size={16} color={styles.iconColor.color} style={styles.detailIcon} />
                        <Text style={styles.detailText}>{session.location}</Text>
                    </View>
                     {/* Tutor */}
                     <View style={styles.detailRow}>
                        <Feather name="user" size={16} color={styles.iconColor.color} style={styles.detailIcon} />
                         <View style={styles.tutorInfoContainer}>
                             {renderTutorAvatar(session.tutorName)}
                             <Text style={[styles.detailText, styles.tutorName]}>{session.tutorName}</Text>
                         </View>
                    </View>
                </View>

                {/* Action Button (Only for Upcoming) */}
                {!isPast && (
                    <TouchableOpacity
                        style={styles.calendarButton}
                        onPress={() => handleAddToCalendar(session)}
                    >
                         <Feather name="plus-circle" size={16} color={styles.calendarButtonText.color} style={styles.detailIcon}/>
                        <Text style={styles.calendarButtonText}>Add to Calendar</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
                <Text style={styles.pageTitle}>Practical Sessions</Text>

                {/* --- Upcoming Sessions Section --- */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
                    {upcomingSessions.length > 0 ? (
                        // Use map for vertical stacking (replace with FlatList + numColumns for grid)
                        upcomingSessions.map(session => renderSessionCard(session, false))
                    ) : (
                        <View style={styles.emptyStateContainer}>
                            <Text style={styles.emptyStateText}>No upcoming practical sessions found.</Text>
                        </View>
                    )}
                </View>

                {/* --- Past Sessions Section --- */}
                <View style={[styles.sectionContainer, styles.pastSectionContainer]}>
                    <Text style={styles.sectionTitle}>Past Sessions</Text>
                     {pastSessions.length > 0 ? (
                        pastSessions.map(session => renderSessionCard(session, true))
                     ) : (
                         <View style={styles.emptyStateContainer}>
                             <Text style={styles.emptyStateText}>No past practical sessions found.</Text>
                         </View>
                     )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    // Core Colors (reuse from previous theme)
    colorPrimaryText: { color: '#1e293b' },
    colorSecondaryText: { color: '#64748b' },
    colorMutedText: { color: '#94a3b8' },
    colorBackground: { backgroundColor: '#f8fafc' },
    colorCardBackground: { backgroundColor: '#ffffff' },
    colorBorder: { borderColor: '#e2e8f0' },
    colorAccent: { color: '#2563eb' },
    iconColor: { color: '#64748b' }, // Default icon color

    safeArea: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    container: {
        flex: 1,
    },
    scrollContentContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    pageTitle: {
        fontSize: 24, // text-2xl approx
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 24, // space-y-8 approx (adjust as needed)
    },
    sectionContainer: {
        marginBottom: 32, // space-y-8 approx
    },
    pastSectionContainer: {
        opacity: 0.85, // Slightly dimmed appearance for past section
    },
    sectionTitle: {
        fontSize: 20, // text-xl approx
        fontWeight: '600', // Semi-bold
        color: '#1e293b',
        marginBottom: 16, // Space below section title
    },
    // Session Card Styles
    sessionCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 16, // gap-6 approx (adjust spacing between cards)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        overflow: 'hidden', // Ensures button rounding is clipped
    },
    pastSessionCard: {
         // Could add specific styles for past cards if needed, e.g., different border
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Align badge to top right
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9', // Lighter separator
    },
    headerTextContainer: {
        flex: 1, // Allow text to take available space
        marginRight: 10, // Space before badge
    },
    sessionTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    trainingTitle: {
        fontSize: 13,
        color: '#64748b', // Secondary text color
    },
     // Badge Styles (Status: Upcoming/Completed)
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 2, // Align slightly better with title
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '500',
    },
    cardContent: {
        paddingVertical: 8, // Reduce top/bottom padding slightly
        paddingHorizontal: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8, // Consistent vertical spacing
    },
    detailIcon: {
        marginRight: 10,
    },
    detailText: {
        fontSize: 14,
        color: '#334155', // Slightly darker secondary text
        flexShrink: 1, // Allow text to wrap or shrink
    },
    tutorInfoContainer: { // Row specific for tutor avatar + name
        flexDirection: 'row',
        alignItems: 'center',
    },
    tutorAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#e2e8f0',
        marginRight: 8, // Space between avatar and name
        alignItems: 'center',
        justifyContent: 'center',
    },
     tutorAvatarText: {
        color: '#64748b',
        fontWeight: 'bold',
        fontSize: 11,
    },
     tutorName: {
        fontWeight: '500', // Make tutor name slightly bolder
     },
    // Calendar Button
    calendarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff', // White background
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0', // Match card border
        paddingVertical: 12,
        // Removed border for outline effect via background/borderTop
        // borderRadius: is applied by the card's overflow: hidden
    },
    calendarButtonText: {
        color: '#4b5563', // Dark gray text for outline button
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
    },
    // Empty State Styles
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        backgroundColor: '#f8fafc', // Slightly different bg for empty state
    },
    emptyStateText: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
});

export default PracticalSessionsScreen;