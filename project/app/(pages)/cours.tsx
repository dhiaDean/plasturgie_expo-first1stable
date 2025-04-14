import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'; // Using Feather and MaterialCommunityIcons for variety
import Header from '@/components/Header';

// Define a type for the course data (good practice with TypeScript)
type CourseType = {
  id: number;
  title: string;
  description: string;
  content: string;
  objectives: string;
  progress: number;
  status: "In Progress" | "Completed" | "Just Started";
  createdBy: string;
  quizId: number | null;
  hasQuiz: boolean;
};

// Mock data (would come from API/state management)
const coursesData: CourseType[] = [
    {
        id: 1,
        title: "Introduction to Injection Molding",
        description: "Learn the basics of injection molding process and techniques.",
        content: "This comprehensive course covers the fundamentals of injection molding, including material selection, machine operation, process parameters, and common defects.",
        objectives: "By the end of this course, you will understand the injection molding process, machine components, and basic troubleshooting.",
        progress: 75,
        status: "In Progress",
        createdBy: "Dr. Albert Johnson",
        quizId: 1,
        hasQuiz: true,
    },
    {
        id: 2,
        title: "Plastic Recycling Methods",
        description: "Learn modern techniques for efficient plastic recycling.",
        content: "This course explores various recycling methods for different plastic types, focusing on sustainability, economic viability, and technological advancements.",
        objectives: "Understand different recycling processes, equipment requirements, and quality control measures for recycled plastics.",
        progress: 100,
        status: "Completed",
        createdBy: "Sarah Williams",
        quizId: 2,
        hasQuiz: true,
    },
    {
        id: 3,
        title: "Advanced Extrusion Techniques",
        description: "Master advanced extrusion processes for complex parts.",
        content: "An in-depth look at advanced extrusion parameters, die design considerations, material behavior under high shear, and optimization strategies.",
        objectives: "Master complex extrusion parameters, troubleshoot common issues, and optimize processes for different materials.",
        progress: 10,
        status: "Just Started",
        createdBy: "Michael Chen",
        quizId: null,
        hasQuiz: false,
    },
     {
        id: 4,
        title: "Polymer Science Fundamentals",
        description: "Understand the core principles of polymer chemistry and physics.",
        content: "Covers polymer structures, synthesis, properties (mechanical, thermal), and characterization techniques relevant to the plastics industry.",
        objectives: "Gain a solid foundation in polymer science to better understand material selection and processing.",
        progress: 0,
        status: "Just Started", // Example of another just started
        createdBy: "Dr. Evelyn Reed",
        quizId: 4,
        hasQuiz: true,
    },
];

// --- Reusable Components (can be moved to separate files) ---

interface BadgeProps {
  status: CourseType['status'];
}

const StatusBadge: React.FC<BadgeProps> = ({ status }) => {
  let style = styles.badgeBase;
  let textStyle = styles.badgeTextBase;

  switch (status) {
    case "Completed":
      style = { ...style, ...styles.badgeCompleted };
      textStyle = { ...textStyle, ...styles.badgeTextCompleted };
      break;
    case "In Progress":
      style = { ...style, ...styles.badgeInProgress };
      textStyle = { ...textStyle, ...styles.badgeTextInProgress };
      break;
    case "Just Started":
      style = { ...style, ...styles.badgeJustStarted };
      textStyle = { ...textStyle, ...styles.badgeTextJustStarted };
      break;
  }

  return (
    

    <View style={style}>
      <Text style={textStyle}>{status}</Text>
    </View>
  );
};

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => (
  <View style={styles.progressBarBackground}>
    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
  </View>
);

interface CourseCardProps {
  course: CourseType;
  onTakeQuiz: (quizId: number) => void;
  isCompletedTab?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onTakeQuiz, isCompletedTab = false }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'objectives'>('content');
  const canTakeQuiz = course.progress >= 70; // Requirement for active courses

  return (
    
    <View style={styles.card}>
        
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderText}>
          <Text style={styles.cardTitle}>{course.title}</Text>
          <Text style={styles.cardDescription}>{course.description}</Text>
        </View>
        <StatusBadge status={course.status} />
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        {/* Inner Tabs */}
        <View style={styles.innerTabsContainer}>
          <TouchableOpacity
            style={[styles.innerTab, activeTab === 'content' && styles.innerTabActive]}
            onPress={() => setActiveTab('content')}
          >
            <Text style={[styles.innerTabText, activeTab === 'content' && styles.innerTabTextActive]}>Content</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.innerTab, activeTab === 'objectives' && styles.innerTabActive]}
            onPress={() => setActiveTab('objectives')}
          >
            <Text style={[styles.innerTabText, activeTab === 'objectives' && styles.innerTabTextActive]}>Objectives</Text>
          </TouchableOpacity>
        </View>

        {/* Inner Tab Content */}
        <View style={styles.innerTabContent}>
          {activeTab === 'content' && (
            <View>
              <View style={styles.contentRow}>
                <Feather name="file-text" size={18} color="#666" style={styles.contentIcon} />
                <Text style={styles.contentText}>{course.content}</Text>
              </View>
              <View style={[styles.contentRow, { marginTop: 10 }]}>
                 <Feather name="clock" size={16} color="#666" style={styles.contentIconSmall} />
                 <Text style={styles.creatorText}>Created by: {course.createdBy}</Text>
              </View>
            </View>
          )}
          {activeTab === 'objectives' && (
            <View style={styles.contentRow}>
              <Feather name="check-circle" size={18} color="#666" style={styles.contentIcon} />
              <Text style={styles.contentText}>{course.objectives}</Text>
            </View>
          )}
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabelText}>Progress</Text>
            <Text style={styles.progressPercentText}>{course.progress}%</Text>
          </View>
          <ProgressBar progress={course.progress} />
        </View>
      </View>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.buttonOutline}>
            <Feather name="play-circle" size={16} color="#3b82f6" style={styles.buttonIcon} />
            <Text style={styles.buttonOutlineText}>
                {isCompletedTab ? "Review Course" : "Continue Learning"}
            </Text>
        </TouchableOpacity>

        {course.hasQuiz && (
          <TouchableOpacity
            style={[
                styles.buttonPrimary,
                !isCompletedTab && !canTakeQuiz && styles.buttonDisabled // Disable if active tab and progress < 70
            ]}
            onPress={() => course.quizId && onTakeQuiz(course.quizId)}
            disabled={!isCompletedTab && !canTakeQuiz}
          >
            <MaterialCommunityIcons name="book-open-page-variant-outline" size={16} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonPrimaryText}>
                {isCompletedTab ? "Take Quiz Again" : "Take Quiz"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};


// --- Main Courses Screen Component ---

const CoursesScreen = () => {
  const navigation = useNavigation<any>(); // Use any for simplicity, replace with specific navigation prop type if needed
  const [currentTab, setCurrentTab] = useState<'active' | 'completed'>('active');

  const activeCourses = coursesData.filter(course => course.status !== "Completed");
  const completedCourses = coursesData.filter(course => course.status === "Completed");

  const handleTakeQuiz = (quizId: number) => {
    // Navigate to the Quiz screen, passing the quizId
    // Ensure you have a 'Quiz' screen defined in your navigator
    navigation.navigate('Quiz', { quizId });
    console.log(`Navigating to Quiz with ID: ${quizId}`);
  };

  const renderEmptyState = (isCompletedTab: boolean) => (
    <View style={styles.emptyStateContainer}>
      {isCompletedTab ? (
         <Feather name="check-circle" size={60} color="#9ca3af" />
      ) : (
         <MaterialCommunityIcons name="book-open-outline" size={60} color="#9ca3af" />
      )}
      <Text style={styles.emptyStateTitle}>
        {isCompletedTab ? "No Completed Courses" : "No Active Courses"}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {isCompletedTab
          ? "You haven't completed any courses yet."
          : "You don't have any active courses at the moment."}
      </Text>
      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() => navigation.navigate('Catalogue')} // Assuming you have a Catalogue screen
      >
        <Text style={styles.buttonPrimaryText}>Browse Trainings</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.pageTitle}>My Courses</Text>

      {/* Main Tabs */}
      <View style={styles.mainTabsContainer}>
        <TouchableOpacity
          style={[styles.mainTab, currentTab === 'active' && styles.mainTabActive]}
          onPress={() => setCurrentTab('active')}
        >
          <Text style={[styles.mainTabText, currentTab === 'active' && styles.mainTabTextActive]}>
            Active Courses ({activeCourses.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainTab, currentTab === 'completed' && styles.mainTabActive]}
          onPress={() => setCurrentTab('completed')}
        >
          <Text style={[styles.mainTabText, currentTab === 'completed' && styles.mainTabTextActive]}>
            Completed Courses ({completedCourses.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {currentTab === 'active' && (
          activeCourses.length > 0
            ? activeCourses.map((course) => (
                <CourseCard key={course.id} course={course} onTakeQuiz={handleTakeQuiz} isCompletedTab={false} />
              ))
            : renderEmptyState(false)
        )}

        {currentTab === 'completed' && (
          completedCourses.length > 0
            ? completedCourses.map((course) => (
                <CourseCard key={course.id} course={course} onTakeQuiz={handleTakeQuiz} isCompletedTab={true} />
              ))
            : renderEmptyState(true)
        )}
      </View>
    </ScrollView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8fafc', // Light gray background
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1f2937', // Dark gray
  },
  // Main Tabs
  mainTabsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb', // Light border color
  },
  mainTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent', // Default inactive state
  },
  mainTabActive: {
    borderBottomColor: '#3b82f6', // Blue color for active tab
  },
  mainTabText: {
    fontSize: 16,
    color: '#6b7280', // Medium gray
  },
  mainTabTextActive: {
    color: '#3b82f6', // Blue
    fontWeight: '600',
  },
  tabContent: {
    // No specific styles needed here, children handle layout
  },
  // Course Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb', // Light border
    overflow: 'hidden', // Ensures children conform to border radius
  },
  cardHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align items to the top
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cardHeaderText: {
    flex: 1, // Take available space
    marginRight: 10, // Space before the badge
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827', // Very dark gray
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280', // Medium gray
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingTop: 16, // Add padding top
    paddingBottom: 8, // Reduce bottom padding before progress
  },
  // Inner Tabs (Content/Objectives)
  innerTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6', // Light gray background for tabs
    borderRadius: 8,
    marginBottom: 16,
  },
  innerTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8, // Apply radius to individual tabs too
  },
  innerTabActive: {
    backgroundColor: '#fff', // White background for active tab
     // Add shadow for active tab (optional, might need platform specifics)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  innerTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563', // Darker gray for text
  },
  innerTabTextActive: {
    color: '#3b82f6', // Blue for active text
  },
  innerTabContent: {
    marginBottom: 16,
    minHeight: 80, // Ensure some minimum height
  },
  contentRow: {
      flexDirection: 'row',
      alignItems: 'flex-start', // Align icon with start of text
      marginBottom: 6,
  },
   contentIcon: {
      marginRight: 8,
      marginTop: 2, // Align icon slightly better vertically
   },
   contentIconSmall: {
       marginRight: 6,
       marginTop: 1,
   },
   contentText: {
       flex: 1, // Allow text to wrap
       fontSize: 14,
       color: '#374151', // Dark gray
       lineHeight: 20,
   },
    creatorText: {
      fontSize: 13,
      color: '#6b7280', // Medium gray
   },
  // Progress Bar
  progressSection: {
    marginBottom: 16, // Space before the footer
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabelText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  progressPercentText: {
    fontSize: 13,
    color: '#6b7280',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e5e7eb', // Light gray background
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6', // Blue progress fill
    borderRadius: 4,
  },
  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb', // Slightly off-white footer background
  },
  // Buttons
  buttonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#3b82f6', // Blue border
    borderRadius: 6,
  },
  buttonOutlineText: {
    color: '#3b82f6', // Blue text
    fontWeight: '500',
    fontSize: 14,
  },
  buttonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#3b82f6', // Blue background
    borderRadius: 6,
  },
  buttonPrimaryText: {
    color: '#fff', // White text
    fontWeight: '500',
    fontSize: 14,
  },
  buttonIcon: {
    marginRight: 6,
  },
   buttonDisabled: {
     backgroundColor: '#9ca3af', // Gray out disabled button
   },
  // Badge Styles
  badgeBase: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12, // Pill shape
    borderWidth: 1,
  },
  badgeTextBase: {
    fontSize: 12,
    fontWeight: '500',
  },
  badgeCompleted: {
    backgroundColor: '#dcfce7', // Light green
    borderColor: '#bbf7d0', // Lighter green border
  },
  badgeTextCompleted: {
    color: '#166534', // Dark green text
  },
  badgeInProgress: {
    backgroundColor: '#dbeafe', // Light blue
    borderColor: '#bfdbfe', // Lighter blue border
  },
  badgeTextInProgress: {
    color: '#1e40af', // Dark blue text
  },
  badgeJustStarted: {
    backgroundColor: '#fef9c3', // Light yellow
    borderColor: '#fef08a', // Lighter yellow border
  },
  badgeTextJustStarted: {
    color: '#854d0e', // Dark yellow/brown text
  },
  // Empty State
  emptyStateContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      minHeight: Dimensions.get('window').height * 0.5, // Ensure it takes some space
      borderWidth: 1,
      borderColor: '#e5e7eb',
      borderRadius: 12,
      backgroundColor: '#fff',
      marginTop: 20, // Add some margin when it appears
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
});

export default CoursesScreen;