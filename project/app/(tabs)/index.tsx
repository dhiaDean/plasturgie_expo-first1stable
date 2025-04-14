import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Droplets, Code, Zap, Target, Printer, AlertTriangle } from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import { SplashScreen } from 'expo-router';
import Header from '@/components/Header';

// Color constants to match Header.js
const COLORS = {
  primary: '#1e293b',
  background: '#ffffff',
  border: '#e2e8f0',
  hover: '#f1f5f9',
  placeholder: '#94a3b8',
};

SplashScreen.preventAutoHideAsync();

export default function HomeScreen() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const categories = [
    { icon: <Droplets size={24} color="#3b82f6" />, title: 'Injection', count: '12 courses' },
    { icon: <Code size={24} color="#10b981" />, title: 'Extrusion', count: '8 courses' },
    { icon: <Zap size={24} color="#f59e0b" />, title: 'Recycling', count: '10 courses' },
    { icon: <Target size={24} color="#8b5cf6" />, title: 'Materials', count: '15 courses' },
    { icon: <Printer size={24} color="#ec4899" />, title: 'Quality Control', count: '7 courses' },
    { icon: <AlertTriangle size={24} color="#f43f5e" />, title: 'Safety', count: '5 courses' },
  ];

  const popularCourses = [
    {
      id: 1,
      title: 'Introduction to Injection Molding',
      description: 'Learn the fundamentals of injection molding processes for beginners.',
      level: 'Beginner',
      duration: '4 weeks',
      rating: 4.8,
      price: '$199',
      image: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    },
    {
      id: 2,
      title: 'Advanced Extrusion Techniques',
      description: 'Master advanced extrusion techniques for various plastics.',
      level: 'Advanced',
      duration: '6 weeks',
      rating: 4.6,
      price: '$299',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    },
    {
      id: 3,
      title: 'Plastics Recycling Fundamentals',
      description: 'Understand the principles of effective plastics recycling.',
      level: 'Intermediate',
      duration: '3 weeks',
      rating: 4.7,
      price: '$149',
      image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    }
  ];

  const instructors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      title: 'Injection Molding Specialist',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    },
    {
      id: 2,
      name: 'Prof. Michael Chen',
      title: 'Polymer Materials Expert',
      image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    },
    {
      id: 3,
      name: 'Eng. Robert Williams',
      title: 'Recycling Processes Consultant',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    },
    {
      id: 4,
      name: 'Dr. Emma Garcia',
      title: 'Quality Control Specialist',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    }
  ];

  return (
    <View style={styles.wrapper}>
      <Header />
      <ScrollView style={styles.container}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Plasturgie-Nous Academy</Text>
          <Text style={styles.welcomeSubtitle}>Your hub for plasturgy training and education</Text>
        </View>

        {/* Discover Section */}
        <View style={styles.discoverSection}>
          <Text style={styles.discoverTitle}>Discover Plasturgy Excellence</Text>
          <Text style={styles.discoverText}>Explore our catalog of specialized training programs</Text>
          <TouchableOpacity style={styles.browseButton}>
            <Text style={styles.browseButtonText}>Browse Courses</Text>
          </TouchableOpacity>
        </View>

        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Training Categories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <TouchableOpacity key={index} style={styles.categoryCard}>
                <View style={styles.categoryIcon}>
                  {category.icon}
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryCount}>{category.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Popular Courses Section */}
        <View style={styles.popularSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Trainings</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.coursesGrid}>
            {popularCourses.map((course) => (
              <TouchableOpacity key={course.id} style={styles.courseCard}>
                <Image source={{ uri: course.image }} style={styles.courseImage} />
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseDescription}>{course.description}</Text>
                  <View style={styles.courseDetails}>
                    <Text style={styles.courseLevel}>{course.level}</Text>
                    <Text style={styles.duration}>{course.duration}</Text>
                  </View>
                  <View style={styles.courseStats}>
                    <Text style={styles.price}>{course.price}</Text>
                    <Text style={styles.rating}>★ {course.rating}</Text>
                  </View>
                  <TouchableOpacity style={styles.enrollButton}>
                    <Text style={styles.enrollButtonText}>Enroll Now</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Instructors Section */}
        <View style={styles.instructorsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Trainers</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.instructorsGrid}>
            {instructors.map((instructor) => (
              <TouchableOpacity key={instructor.id} style={styles.instructorCard}>
                <Image source={{ uri: instructor.image }} style={styles.instructorImage} />
                <Text style={styles.instructorName}>{instructor.name}</Text>
                <Text style={styles.instructorTitle}>{instructor.title}</Text>
                <TouchableOpacity style={styles.viewProfileButton}>
                  <Text style={styles.viewProfileText}>View Profile</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Plasturgie-Nous Academy. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background, // White background
  },
  container: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  welcomeTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: COLORS.primary, // Dark blue-gray text
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.placeholder, // Medium gray text
  },
  discoverSection: {
    backgroundColor: '#3b82f6', // Keeping the blue background for this section
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  discoverTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: COLORS.background, // White text
    marginBottom: 8,
  },
  discoverText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.border, // Light gray text
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: COLORS.background, // White button
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  browseButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#3b82f6', // Blue text
  },
  categoriesSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: COLORS.primary, // Dark blue-gray text
  },
  seeAll: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#3b82f6', // Blue text
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: COLORS.background, // White background
    borderRadius: 12,
    padding: 12,
    width: '30%', // Adjusted for 3 items per row
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border, // Light gray border
  },
  categoryIcon: {
    backgroundColor: COLORS.hover, // Light gray background
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  categoryTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.primary, // Dark blue-gray text
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.placeholder, // Medium gray text
  },
  popularSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  courseCard: {
    backgroundColor: COLORS.background, // White background
    borderRadius: 12,
    width: '100%', // Full width for single column on mobile
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border, // Light gray border
  },
  courseImage: {
    width: '100%',
    height: 120,
  },
  courseInfo: {
    padding: 12,
  },
  courseTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.primary, // Dark blue-gray text
    marginBottom: 4,
  },
  courseDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.placeholder, // Medium gray text
    marginBottom: 8,
  },
  courseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  courseLevel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.placeholder, // Medium gray text
  },
  duration: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.placeholder, // Medium gray text
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.primary, // Dark blue-gray text
  },
  rating: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#f59e0b', // Keeping the yellow for ratings
  },
  enrollButton: {
    backgroundColor: '#3b82f6', // Blue button
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  enrollButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.background, // White text
  },
  instructorsSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  instructorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  instructorCard: {
    backgroundColor: COLORS.background, // White background
    borderRadius: 12,
    padding: 12,
    width: '48%', // Adjusted for 2 items per row
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border, // Light gray border
  },
  instructorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    backgroundColor: COLORS.hover, // Light gray placeholder
  },
  instructorName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.primary, // Dark blue-gray text
    textAlign: 'center',
    marginBottom: 4,
  },
  instructorTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.placeholder, // Medium gray text
    textAlign: 'center',
    marginBottom: 8,
  },
  viewProfileButton: {
    borderWidth: 1,
    borderColor: '#3b82f6', // Blue border
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  viewProfileText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#3b82f6', // Blue text
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.placeholder, // Medium gray text
  },
});