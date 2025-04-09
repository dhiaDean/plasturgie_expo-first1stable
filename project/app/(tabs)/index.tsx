import { View, Text, StyleSheet, ScrollView, TextInput, Image, TouchableOpacity } from 'react-native';
import { Search, Filter, Droplets, Code, Zap, Target, Printer } from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import { SplashScreen } from 'expo-router';
import Header from '@/components/Header';

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
    { icon: <Droplets size={24} color="#3b82f6" />, title: 'boite eau', count: '42 cours' },
    { icon: <Code size={24} color="#10b981" />, title: 'pieces plastique', count: '65 cours' },
    { icon: <Zap size={24} color="#f59e0b" />, title: 'boite gazouz', count: '28 cours' },
    { icon: <Target size={24} color="#8b5cf6" />, title: 'stylo', count: '36 cours' },
    { icon: <Printer size={24} color="#ec4899" />, title: 'printer machine', count: '78 cours' },
  ];

  const popularCourses = [
    {
      id: 1,
      title: 'Comment réussir dans le fundraising',
      instructor: 'Mohammed Murad',
      rating: 4.8,
      reviews: 124,
      duration: '6h 30min',
      price: '49.99 €',
      image: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    },
    {
      id: 2,
      title: 'Développement Web Fullstack',
      instructor: 'John Doe',
      rating: 4.6,
      reviews: 89,
      duration: '12h 45min',
      price: '69.99 €',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    },
    {
      id: 3,
      title: 'Marketing Digital pour Débutants',
      instructor: 'Sarah Johnson',
      rating: 4.5,
      reviews: 78,
      duration: '8h 15min',
      price: '39.99 €',
      image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    }
  ];

  const instructors = [
    {
      id: 1,
      name: 'John Doe',
      title: 'Expert en Business',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    },
    {
      id: 2,
      name: 'John Doe',
      title: 'Expert en Business',
      image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    },
    {
      id: 3,
      name: 'John Doe',
      title: 'Expert en Business',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    }
  ];

  return (
    <View style={styles.wrapper}>
      <Header />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.name}>Balti Chef</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher des formations..."
              placeholderTextColor="#666"
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Catégories formations</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((category, index) => (
              <TouchableOpacity key={index} style={styles.categoryCard}>
                <View style={styles.categoryIcon}>
                  {category.icon}
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryCount}>{category.count}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.popularSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Formations populaires</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.coursesScroll}>
            {popularCourses.map((course) => (
              <TouchableOpacity key={course.id} style={styles.courseCard}>
                <Image source={{ uri: course.image }} style={styles.courseImage} />
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.instructorName}>{course.instructor}</Text>
                  <View style={styles.courseStats}>
                    <Text style={styles.rating}>★ {course.rating}</Text>
                    <Text style={styles.reviews}>({course.reviews})</Text>
                    <Text style={styles.duration}>{course.duration}</Text>
                  </View>
                  <Text style={styles.price}>{course.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.instructorsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Formateurs vedettes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.instructorsScroll}>
            {instructors.map((instructor) => (
              <TouchableOpacity key={instructor.id} style={styles.instructorCard}>
                <Image source={{ uri: instructor.image }} style={styles.instructorImage} />
                <Text style={styles.instructorName}>{instructor.name}</Text>
                <Text style={styles.instructorTitle}>{instructor.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>Qui sommes-nous ?</Text>
          <Text style={styles.aboutText}>
            CFI Plasturgie est un centre spécialisé dans la formation en plasturgie et composites. Il accompagne les professionels avec des formations innovantes adaptées aux besoins industriels.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  greeting: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#64748b',
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1e293b',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1e293b',
  },
  filterButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1e293b',
  },
  seeAll: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#2563eb',
  },
  categoriesScroll: {
    paddingLeft: 20,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryIcon: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  categoryTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
  },
  popularSection: {
    marginBottom: 24,
  },
  coursesScroll: {
    paddingLeft: 20,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 16,
    width: 280,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: 160,
  },
  courseInfo: {
    padding: 16,
  },
  courseTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
  },
  instructorName: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#f59e0b',
    marginRight: 4,
  },
  reviews: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
    marginRight: 8,
  },
  duration: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
  },
  price: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#2563eb',
  },
  instructorsSection: {
    marginBottom: 24,
  },
  instructorsScroll: {
    paddingLeft: 20,
  },
  instructorCard: {
    alignItems: 'center',
    marginRight: 20,
  },
  instructorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  instructorTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  aboutSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  aboutTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 8,
  },
  aboutText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});