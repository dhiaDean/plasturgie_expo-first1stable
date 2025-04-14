import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons'; // Using Feather for the X icon
import Header from '@/components/Header';
// Define a type for the enrollment data
type EnrollmentType = {
  id: number;
  trainingTitle: string;
  enrollmentDate: string; // Keep as string for simplicity, parse when needed
  status: "Active" | "Completed" | "Pending";
  tutorName: string;
};

// Mock data (would come from API/state management)
const enrollmentsData: EnrollmentType[] = [
    {
      id: 1,
      trainingTitle: "Introduction to Injection Molding",
      enrollmentDate: "2025-03-20",
      status: "Active",
      tutorName: "Dr. Albert Johnson",
    },
    {
      id: 2,
      trainingTitle: "Plastic Recycling Methods",
      enrollmentDate: "2025-03-10",
      status: "Completed",
      tutorName: "Sarah Williams",
    },
    {
      id: 3,
      trainingTitle: "Advanced Extrusion Techniques",
      enrollmentDate: "2025-03-05",
      status: "Pending",
      tutorName: "Michael Chen",
    },
    // Add more or remove to test empty state
];

// --- Reusable Components (can be moved to separate files) ---

interface BadgeProps {
  status: EnrollmentType['status'];
}

// Reusing the StatusBadge concept from the Courses example
const StatusBadge: React.FC<BadgeProps> = ({ status }) => {
  let style = styles.badgeBase;
  let textStyle = styles.badgeTextBase;

  switch (status) {
    case "Completed":
      style = { ...style, ...styles.badgeCompleted };
      textStyle = { ...textStyle, ...styles.badgeTextCompleted };
      break;
    case "Active": // Changed from In Progress to Active
      style = { ...style, ...styles.badgeActive };
      textStyle = { ...textStyle, ...styles.badgeTextActive };
      break;
    case "Pending": // Changed from Just Started to Pending
      style = { ...style, ...styles.badgePending };
      textStyle = { ...textStyle, ...styles.badgeTextPending };
      break;
  }

  return (
    <View style={style}>
      <Text style={textStyle}>{status}</Text>
    </View>
  );
};


// --- Main Enrollments Screen Component ---

const EnrollmentsScreen = () => {
  const navigation = useNavigation<any>(); // Use specific type if available
  // In a real app, you'd likely manage this state with useState/useEffect or state management library
  const [enrollments, setEnrollments] = React.useState(enrollmentsData);

  const handleCancelEnrollment = (enrollmentId: number) => {
    // Find the enrollment to potentially update UI or show confirmation
    const enrollmentToCancel = enrollments.find(e => e.id === enrollmentId);
    if (!enrollmentToCancel) return;

    Alert.alert(
      "Confirm Cancellation",
      `Are you sure you want to cancel your enrollment in "${enrollmentToCancel.trainingTitle}"?`,
      [
        { text: "Keep Enrollment", style: "cancel" },
        {
          text: "Yes, Cancel",
          onPress: () => {
            console.log(`Canceling enrollment: ${enrollmentId}`);
            // --- Simulated API Call & State Update ---
            // In a real app: call API endpoint to cancel enrollment.
            // On success, update the local state:
            // Option 1: Refetch enrollments from the API
            // Option 2: Filter out the canceled enrollment locally (example below)
            setEnrollments(prevEnrollments =>
              prevEnrollments.filter(e => e.id !== enrollmentId)
            );
            // Or update status to "Cancelled" if your backend supports it:
            // setEnrollments(prevEnrollments =>
            //   prevEnrollments.map(e =>
            //     e.id === enrollmentId ? { ...e, status: "Cancelled" } : e
            //   )
            // );
            // -----------------------------------------
          },
          style: "destructive",
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
        // Basic formatting, consider a library like date-fns for robustness
        return new Date(dateString).toLocaleDateString(undefined, { // Use user's locale
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch (e) {
        return dateString; // Fallback if date is invalid
    }
  };

  return (
    <ScrollView style={styles.screenContainer} contentContainerStyle={styles.scrollContentContainer}>
      
      <Text style={styles.pageTitle}>My Enrollments</Text>

      {enrollments.length > 0 ? (
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableHeaderCell, styles.columnTraining]}>Training</Text>
            <Text style={[styles.tableHeaderCell, styles.columnDate]}>Enrolled</Text>
            <Text style={[styles.tableHeaderCell, styles.columnStatus]}>Status</Text>
            <Text style={[styles.tableHeaderCell, styles.columnTutor]}>Tutor</Text>
            <Text style={[styles.tableHeaderCell, styles.columnActions, { textAlign: 'right' }]}>Actions</Text>
          </View>

          {/* Table Body */}
          {enrollments.map((enrollment, index) => (
            <View key={enrollment.id} style={[styles.tableRow, index % 2 !== 0 ? styles.tableRowAlt : null]}>
              <Text style={[styles.tableCell, styles.columnTraining, styles.cellTrainingTitle]}>{enrollment.trainingTitle}</Text>
              <Text style={[styles.tableCell, styles.columnDate]}>{formatDate(enrollment.enrollmentDate)}</Text>
              <View style={[styles.tableCell, styles.columnStatus]}>
                <StatusBadge status={enrollment.status} />
              </View>
              <Text style={[styles.tableCell, styles.columnTutor]}>{enrollment.tutorName}</Text>
              <View style={[styles.tableCell, styles.columnActions, styles.actionsCell]}>
                {enrollment.status !== "Completed" && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelEnrollment(enrollment.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Increases tap area
                  >
                    <Feather name="x" size={16} color="#ef4444" style={styles.cancelIcon} />
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          <Text style={styles.tableCaption}>List of your current and past enrollments</Text>
        </View>
      ) : (
        // Empty State
        <View style={styles.emptyStateContainer}>
          <Feather name="list" size={60} color="#9ca3af" />
          <Text style={styles.emptyStateTitle}>No Enrollments Found</Text>
          <Text style={styles.emptyStateSubtitle}>
            You haven't enrolled in any training courses yet.
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Catalogue')} // Navigate to Catalogue screen
          >
            <Text style={styles.browseButtonText}>Browse Trainings</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8fafc', // Light gray background
  },
  scrollContentContainer: {
      padding: 16,
      paddingBottom: 40, // Ensure space at the bottom
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1f2937', // Dark gray
  },
  // Table Styles
  tableContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#ffffff', // White background for table area
    overflow: 'hidden', // Clip content to rounded border
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center', // Vertically align items in the row
    paddingVertical: 12, // Add vertical padding to rows
    paddingHorizontal: 10, // Horizontal padding for the row content
  },
   tableRowAlt: { // Optional alternating row color
    backgroundColor: '#f9fafb',
   },
  tableHeader: {
    backgroundColor: '#f9fafb', // Slightly different background for header
    borderBottomWidth: 2, // Thicker border below header
    paddingVertical: 10, // Slightly less padding for header
  },
  tableCell: {
    fontSize: 14,
    color: '#374151', // Default cell text color
    paddingHorizontal: 4, // Horizontal padding within cells
  },
  tableHeaderCell: {
    fontSize: 13,
    fontWeight: '600', // Bolder header text
    color: '#4b5563', // Header text color
    textTransform: 'uppercase', // Optional: Uppercase headers
    paddingHorizontal: 4, // Horizontal padding within cells
  },
  // Column Widths using Flex (adjust ratios as needed)
  columnTraining: {
      flex: 3, // Takes more space
      minWidth: 120, // Ensure minimum width
  },
  columnDate: {
      flex: 2,
      minWidth: 80,
  },
  columnStatus: {
      flex: 1.5,
      minWidth: 70,
      alignItems: 'flex-start', // Align badge to the start
  },
  columnTutor: {
      flex: 2,
      minWidth: 100,
  },
  columnActions: {
      flex: 1.5,
      minWidth: 80,
      alignItems: 'flex-end', // Align actions to the right
  },
  cellTrainingTitle: {
    fontWeight: '500', // Make training title slightly bolder
    color: '#111827',
  },
  actionsCell: {
      justifyContent: 'flex-end', // Push content to the right
      flexDirection: 'row', // Ensure button elements align horizontally if needed
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    // Add some visual indication if needed, e.g., background on hover/press
    // For now, keeping it simple like the web 'ghost' button
  },
  cancelIcon: {
    marginRight: 4,
  },
  cancelButtonText: {
    color: '#ef4444', // Red color for cancel text
    fontSize: 14,
    fontWeight: '500',
  },
  tableCaption: {
      fontSize: 12,
      color: '#6b7280',
      padding: 12,
      textAlign: 'center',
      backgroundColor: '#f9fafb',
  },
  // Badge Styles (Adjust colors to match web example)
  badgeBase: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start', // Make badge only as wide as its content
  },
  badgeTextBase: {
    fontSize: 12,
    fontWeight: '500',
  },
  badgeCompleted: {
    backgroundColor: '#dcfce7', // Light green
    borderColor: '#bbf7d0',
  },
  badgeTextCompleted: {
    color: '#166534', // Dark green text
  },
  badgeActive: { // Use blue for Active
    backgroundColor: '#dbeafe', // Light blue
    borderColor: '#bfdbfe',
  },
  badgeTextActive: {
    color: '#1e40af', // Dark blue text
  },
  badgePending: { // Use yellow for Pending
    backgroundColor: '#fef9c3', // Light yellow
    borderColor: '#fef08a',
  },
  badgeTextPending: {
    color: '#854d0e', // Dark yellow/brown text
  },
   // Empty State
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#fff',
    minHeight: 250, // Give it some minimum height
  },
  emptyStateTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  emptyStateSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#3b82f6', // Blue background (same as primary button in Courses)
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 15,
  },
});

export default EnrollmentsScreen;