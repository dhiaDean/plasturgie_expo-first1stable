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
    ActivityIndicator,
    RefreshControl,
    Modal,
    TextInput,
    Platform,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '../services/api.service';
import { Enrollment, Certification, Course, UserProfileUpdate } from '../services/api.types';
import { FontAwesome, Feather, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AlignCenter } from 'lucide-react-native';

// --- Helper Functions ---
const renderAvatar = (name: string | undefined, avatarUrl: string | null, size: number = styles.avatar.width, onPress?: () => void) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    
    const content = avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} />
    ) : (
        <View style={[styles.avatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }]}>
            <FontAwesome name="user-circle" size={size * 0.6} color="#94a3b8" />
        </View>
    );
    
    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} style={styles.avatarContainer}>
                {content}
                <View style={styles.editAvatarOverlay}>
                    <Feather name="edit-3" size={24} color="#ffffff" />
                </View>
            </TouchableOpacity>
        );
    }
    
    return content;
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
    const { user, logout, isAuthenticated, refreshUserData } = useAuth();
    console.log('ProfileScreen: Rendering with user:', JSON.stringify(user));

    // --- State for fetched data ---
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [courses, setCourses] = useState<Record<number, Course>>({});
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);
    const [isLoadingCerts, setIsLoadingCerts] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // --- State for Edit Profile Modal & Form ---
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [editFormErrors, setEditFormErrors] = useState<Partial<UserProfileUpdate & { form?: string, confirmPassword?: string }>>({});

    // --- State for Avatar/Photo ---
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // --- Populate form fields when user data is available or modal opens ---
    useEffect(() => {
        if (user) {
            setEditFirstName(user.firstName || '');
            setEditLastName(user.lastName || '');
            setEditEmail(user.email || '');
            // If user has avatar url, set it
            if (user.avatarUrl) {
                setAvatarUrl(user.avatarUrl);
            }
        }
    }, [user, isEditModalVisible]);

    // --- Avatar/Image Functions ---
    const handleAvatarPress = () => {
        setIsImageModalVisible(true);
    };

    const requestPermission = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
                return false;
            }
            return true;
        }
        return true;
    };

    const takePhoto = async () => {
        const hasPermission = await requestPermission();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo');
        } finally {
            setIsImageModalVisible(false);
        }
    };

    const pickImage = async () => {
        const hasPermission = await requestPermission();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        } finally {
            setIsImageModalVisible(false);
        }
    };

    const uploadImage = async (uri: string) => {
        if (!user?.id) {
            Alert.alert('Error', 'User information not available');
            return;
        }

        setIsUploadingImage(true);
        try {
            // Create FormData for the image upload
            const formData = new FormData();
            formData.append('file', {
                uri,
                name: 'profile-image.jpg',
                type: 'image/jpeg',
            } as any);

            // Call API to upload the image
            console.log('Uploading avatar image...');
            // TODO: Replace with actual API call for avatar upload
            // const response = await apiService.uploadUserAvatar(user.id, formData);
            
            // Simulate a successful upload
            // For actual implementation, use the URL returned from your API
            setTimeout(() => {
                // Simulate a URL from your backend
                const newAvatarUrl = uri; // In actual implementation, this would be the URL from your server
                setAvatarUrl(newAvatarUrl);
                
                // Update user context if needed
                refreshUserData();
                
                Alert.alert('Success', 'Profile picture updated successfully!');
                setIsUploadingImage(false);
            }, 1500);
            
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Upload Failed', 'Could not upload image. Please try again.');
            setIsUploadingImage(false);
        }
    };

    const removeAvatar = async () => {
        if (!user?.id) {
            Alert.alert('Error', 'User information not available');
            return;
        }

        setIsUploadingImage(true);
        try {
            // Call API to remove the avatar
            console.log('Removing avatar image...');
            // TODO: Replace with actual API call
            // await apiService.removeUserAvatar(user.id);
            
            // Simulate a successful removal
            setTimeout(() => {
                setAvatarUrl(null);
                
                // Update user context if needed
                refreshUserData();
                
                Alert.alert('Success', 'Profile picture removed successfully!');
                setIsUploadingImage(false);
                setIsImageModalVisible(false);
            }, 1000);
            
        } catch (error) {
            console.error('Error removing avatar:', error);
            Alert.alert('Failed', 'Could not remove profile picture. Please try again.');
            setIsUploadingImage(false);
        }
    };

    // --- Data Fetching Logic --- (RESTORED FROM OLD FILE)
    const fetchData = useCallback(async () => {
        if (!isAuthenticated || !user) {
            console.log("Not authenticated, skipping profile data fetch.");
            setEnrollments([]);
            setCertifications([]);
            setCourses({});
            return;
        }
        console.log("Fetching profile data...");
        setError(null);
        setIsLoadingEnrollments(true);
        setIsLoadingCerts(true);

        try {
            // Fetch enrollments and certifications concurrently
            const [enrollmentData, certificationData] = await Promise.all([
                apiService.getUserEnrollments(),
                apiService.getUserCertifications()
            ]);

            setEnrollments(enrollmentData || []);
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
                setCourses({});
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
    }, [isAuthenticated, user]);

    // --- Initial Fetch and Refresh ---
    useEffect(() => {
        fetchData();
    }, [fetchData]);

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

    // --- Handle Edit Profile Submission ---
    const handleProfileUpdate = async () => {
        // Basic Frontend Validation
        let errors: Partial<UserProfileUpdate & { form?: string, confirmPassword?: string }> = {};
        if (!editFirstName.trim()) errors.firstName = "First name is required.";
        if (!editLastName.trim()) errors.lastName = "Last name is required.";
        if (!editEmail.trim()) errors.email = "Email is required.";
        // Basic email format validation (simple)
        else if (!/\S+@\S+\.\S+/.test(editEmail)) errors.email = "Email address is invalid.";

        if (newPassword) { // Only validate password fields if new password is being set
            if (!currentPassword) errors.currentPassword = "Current password is required to change password.";
            if (newPassword.length < 6) errors.newPassword = "New password must be at least 6 characters.";
            if (newPassword !== confirmNewPassword) errors.confirmPassword = "New passwords do not match.";
        }
        setEditFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return; // Stop if there are validation errors
        }

        setIsUpdatingProfile(true);
        setEditFormErrors({}); // Clear previous form-level errors

        const updatePayload: UserProfileUpdate = {
            firstName: editFirstName,
            lastName: editLastName,
            email: editEmail,
        };

        if (newPassword && currentPassword) {
            updatePayload.currentPassword = currentPassword;
            updatePayload.newPassword = newPassword;
        }

        try {
            console.log("Updating profile with payload:", updatePayload);
            // TODO: Add apiService.updateUserProfile(user.id, updatePayload) or apiService.updateMyProfile(updatePayload)
            // For now, simulate success:
            // await apiService.updateMyProfile(updatePayload); // Replace with actual call

            Alert.alert("Success", "Profile updated successfully!");
            setIsEditModalVisible(false);
            await refreshUserData(); // Refresh user data in AuthContext to reflect changes
            // Clear password fields after submission
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err: any) {
            console.error("Failed to update profile:", err);
            const message = err?.response?.data?.message || err?.message || "Failed to update profile.";
            setEditFormErrors({ form: message }); // Show general form error in modal
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#64748b"/>}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    {isUploadingImage ? (
                        <View style={styles.loadingAvatarContainer}>
                            <ActivityIndicator size="large" color="#4f46e5" />
                        </View>
                    ) : (
                        renderAvatar(user?.username, avatarUrl, styles.avatar.width, handleAvatarPress)
                    )}
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
                        ) : error && !enrollments.length ? (
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
                    {/* Edit Profile Button */}
                    <TouchableOpacity style={styles.editProfileButton} onPress={() => setIsEditModalVisible(true)}>
                        <Feather name="edit-2" size={16} color={styles.editProfileButtonText.color} />
                        <Text style={styles.editProfileButtonText}>Edit My Profile</Text>
                    </TouchableOpacity>
                    {/* Logout Button */}
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                    >
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isEditModalVisible}
                onRequestClose={() => {
                    if (!isUpdatingProfile) setIsEditModalVisible(false);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Profile</Text>

                        {editFormErrors.form && <Text style={styles.modalFormErrorText}>{editFormErrors.form}</Text>}

                        <ScrollView>
                            <Text style={styles.inputLabel}>First Name</Text>
                            <TextInput
                                style={[styles.input, editFormErrors.firstName ? styles.inputError : null]}
                                value={editFirstName}
                                onChangeText={setEditFirstName}
                                placeholder="First Name"
                                autoCapitalize="words"
                                editable={!isUpdatingProfile}
                            />
                            {editFormErrors.firstName && <Text style={styles.errorTextInline}>{editFormErrors.firstName}</Text>}

                            <Text style={styles.inputLabel}>Last Name</Text>
                            <TextInput
                                style={[styles.input, editFormErrors.lastName ? styles.inputError : null]}
                                value={editLastName}
                                onChangeText={setEditLastName}
                                placeholder="Last Name"
                                autoCapitalize="words"
                                editable={!isUpdatingProfile}
                            />
                            {editFormErrors.lastName && <Text style={styles.errorTextInline}>{editFormErrors.lastName}</Text>}

                            <Text style={styles.inputLabel}>Email</Text>
                            <TextInput
                                style={[styles.input, editFormErrors.email ? styles.inputError : null]}
                                value={editEmail}
                                onChangeText={setEditEmail}
                                placeholder="Email Address"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!isUpdatingProfile}
                            />
                            {editFormErrors.email && <Text style={styles.errorTextInline}>{editFormErrors.email}</Text>}

                            <Text style={styles.passwordSectionTitle}>Change Password (Optional)</Text>
                            <Text style={styles.inputLabel}>Current Password</Text>
                            <TextInput
                                style={[styles.input, editFormErrors.currentPassword ? styles.inputError : null]}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                placeholder="Current Password"
                                secureTextEntry
                                editable={!isUpdatingProfile}
                            />
                            {editFormErrors.currentPassword && <Text style={styles.errorTextInline}>{editFormErrors.currentPassword}</Text>}

                            <Text style={styles.inputLabel}>New Password</Text>
                            <TextInput
                                style={[styles.input, editFormErrors.newPassword ? styles.inputError : null]}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="New Password (min. 6 chars)"
                                secureTextEntry
                                editable={!isUpdatingProfile}
                            />
                            {editFormErrors.newPassword && <Text style={styles.errorTextInline}>{editFormErrors.newPassword}</Text>}

                            <Text style={styles.inputLabel}>Confirm New Password</Text>
                            <TextInput
                                style={[styles.input, editFormErrors.confirmPassword ? styles.inputError : null]}
                                value={confirmNewPassword}
                                onChangeText={setConfirmNewPassword}
                                placeholder="Confirm New Password"
                                secureTextEntry
                                editable={!isUpdatingProfile}
                            />
                            {editFormErrors.confirmPassword && <Text style={styles.errorTextInline}>{editFormErrors.confirmPassword}</Text>}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancelButton]}
                                onPress={() => setIsEditModalVisible(false)}
                                disabled={isUpdatingProfile}
                            >
                                <Text style={styles.modalCancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalSubmitButton, isUpdatingProfile && styles.modalButtonDisabled]}
                                onPress={handleProfileUpdate}
                                disabled={isUpdatingProfile}
                            >
                                <Text style={styles.modalSubmitButtonText}>Save Changes</Text>
                                {isUpdatingProfile && <ActivityIndicator size="small" color="#fff" style={{marginLeft: 10}} />}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Image Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isImageModalVisible}
                onRequestClose={() => {
                    if (!isUploadingImage) setIsImageModalVisible(false);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.imageModalContent}>
                        <Text style={styles.modalTitle}>Change Profile Picture</Text>
                        
                        <TouchableOpacity style={styles.imageOptionButton} onPress={takePhoto} disabled={isUploadingImage}>
                            <MaterialIcons name="photo-camera" size={24} color="#3730a3" />
                            <Text style={styles.imageOptionText}>Take a Photo</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.imageOptionButton} onPress={pickImage} disabled={isUploadingImage}>
                            <MaterialIcons name="photo-library" size={24} color="#3730a3" />
                            <Text style={styles.imageOptionText}>Choose from Gallery</Text>
                        </TouchableOpacity>
                        
                        {avatarUrl && (
                            <TouchableOpacity style={styles.imageOptionButton} onPress={removeAvatar} disabled={isUploadingImage}>
                                <MaterialIcons name="delete" size={24} color="#dc2626" />
                                <Text style={styles.imageOptionTextDanger}>Remove Current Photo</Text>
                            </TouchableOpacity>
                        )}
                        
                        <TouchableOpacity 
                            style={styles.cancelImageButton}
                            onPress={() => setIsImageModalVisible(false)}
                            disabled={isUploadingImage}
                        >
                            <Text style={styles.cancelImageButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        backgroundColor: '#e2e8f0',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 0,
    },
    loadingAvatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editAvatarOverlay: {
        position: 'absolute',
        bottom: 15,
        right: 0,
        backgroundColor: 'rgba(37, 99, 235, 0.8)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
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
    editProfileButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#e0e7ff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#a5b4fc',
    },
    editProfileButtonText: {
        color: '#3730a3',
        marginLeft: 8,
        fontWeight: '500',
        fontSize: 14,
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
    sectionContent: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        textAlign: 'center',
        paddingVertical: 10,
    },
    listItem: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
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
        color: '#dc2626',
        textAlign: 'center',
        paddingVertical: 10,
    },
    logoutButton: {
        backgroundColor: '#fee2e2',
        borderRadius: 20,
        height: 47,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#fca5a5',
    },
    logoutButtonText: {
        color: '#b91c1c',
        fontSize: 16,
        fontWeight: 'bold',
    },
    
    
    
    // Modal and Form Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
        width: '90%',
        maxWidth: 450,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        maxHeight: '85%',
    },
    imageModalContent: {
        width: '80%',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalFormErrorText: {
        color: '#dc2626',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
    },
    inputLabel: {
        fontSize: 14,
        color: '#334155',
        marginBottom: 6,
        marginTop: 10,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#f8fafc',
        height: 48,
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        fontSize: 15,
        color: '#1e293b',
    },
    inputError: {
        borderColor: '#ef4444',
    },
    errorTextInline: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
    },
    passwordSectionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#4b5563',
        marginTop: 20,
        marginBottom: 10,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 15,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 24,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginLeft: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalButtonDisabled: {
        opacity: 0.7,
    },
    modalCancelButton: {
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    modalCancelButtonText: {
        color: '#334155',
        fontWeight: '500',
    },
    modalSubmitButton: {
        backgroundColor: '#2563eb',
    },
    modalSubmitButtonText: {
        color: '#ffffff',
        fontWeight: '500',
    },
    
    // Image Option Styles
    imageOptionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        marginVertical: 8,
        width: '100%',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    imageOptionText: {
        marginLeft: 16,
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '500',
    },
    imageOptionTextDanger: {
        marginLeft: 16,
        fontSize: 16,
        color: '#dc2626',
        fontWeight: '500',
    },
    cancelImageButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 16,
        backgroundColor: '#e2e8f0',
        width: '100%',
        alignItems: 'center',
    },
    cancelImageButtonText: {
        color: '#64748b',
        fontSize: 16,
        fontWeight: '500',
    },
    iconColor: { color: '#64748b' },
});
