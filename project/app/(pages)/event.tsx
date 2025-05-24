import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    Modal,
    Platform,
    Button, // Keeping Button for modal simplicity, can be styled TouchableOpacity
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Keep if needed for navigation from events

import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { apiService } from '../services/api.service'; // Adjust path if necessary
import { Event } from '../services/api.types'; // Adjust path if necessary

// --- Helper to Format Date for Display ---
const formatDateDisplay = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatFullDateTime = (dateString: string | undefined) => {
    if (!dateString) return 'Date N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
};

// Helper to compare dates ignoring time for filtering
const isDateInRange = (eventDateStr: string, startDate: Date | null, endDate: Date | null): boolean => {
    if (!startDate && !endDate) return true; // No range selected, include all

    const eventDate = new Date(eventDateStr);
    eventDate.setHours(0, 0, 0, 0); // Normalize event date

    if (startDate && eventDate < new Date(new Date(startDate).setHours(0,0,0,0))) {
        return false;
    }
    if (endDate && eventDate > new Date(new Date(endDate).setHours(0,0,0,0))) {
        return false;
    }
    return true;
};

// --- Main Component ---
export default function EventsScreen() {
    const router = useRouter(); // Keep if navigating from event items
    const { user, isAuthenticated, token } = useAuth(); // Get auth state

    // --- State for fetched data & filters ---
    const [allEvents, setAllEvents] = useState<Event[]>([]); // Stores all fetched events
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]); // Stores events after filtering
    const [locationFilter, setLocationFilter] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // --- Modal State for Date Range Picker ---
    const [modalVisible, setModalVisible] = useState(false);
    const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
    const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
    const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

    // --- Data Fetching Logic ---
    const fetchData = useCallback(async (isRefresh: boolean = false) => {
        console.log("EventsScreen: Fetching events...");
        setError(null);
        if (!isRefresh) setIsLoading(true); // Only set full loading if not a refresh

        try {
            // apiService.setToken(token); // Only if events endpoint requires auth
            const eventsData = await apiService.getEvents();
            setAllEvents(eventsData || []); // Store all events
            // Apply initial filters (if any) or show all
            console.log(`EventsScreen: Fetched ${eventsData?.length || 0} events.`);
        } catch (err: any) {
            console.error("EventsScreen: Failed to fetch events:", err);
            const message = err?.response?.data?.message || err?.message || "Failed to load events.";
            setError(message);
            setAllEvents([]); // Clear events on error
        } finally {
            if (!isRefresh) setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []); // No dependencies here, will be called by useEffect

    // --- Initial Fetch ---
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Filtering Logic ---
    useEffect(() => {
        let eventsToFilter = [...allEvents]; // Work with a copy

        // Apply Location Filter (case-insensitive)
        if (locationFilter.trim()) {
            eventsToFilter = eventsToFilter.filter(event =>
                event.location?.toLowerCase().includes(locationFilter.toLowerCase())
            );
        }

        // Apply Date Range Filter
        if (startDate || endDate) { // Apply if at least one date is set
            const effectiveStartDate = startDate;
            const effectiveEndDate = endDate || startDate; // If only start is set, filter for that single day
             if (effectiveStartDate && effectiveEndDate && effectiveStartDate > effectiveEndDate) {
                 // Don't filter if range is invalid, or show warning
             } else {
                eventsToFilter = eventsToFilter.filter(event =>
                    isDateInRange(event.eventDate, effectiveStartDate, effectiveEndDate)
                );
             }
        }
        setFilteredEvents(eventsToFilter);
    }, [allEvents, locationFilter, startDate, endDate]);

    // --- Refresh Handler ---
    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchData(true); // Pass true to indicate it's a refresh
    }, [fetchData]);


    // --- Date Picker onChange Handler ---
    const onDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
        const currentDate = selectedDate || (showPicker === 'start' ? tempStartDate : tempEndDate) || new Date();
        setShowPicker(null); // Hide picker
        if (event.type === 'set' && selectedDate) {
            if (showPicker === 'start') setTempStartDate(currentDate);
            else if (showPicker === 'end') setTempEndDate(currentDate);
        }
    };

    // --- Modal Actions ---
    const openDateModal = () => {
        setTempStartDate(startDate ? new Date(startDate) : null);
        setTempEndDate(endDate ? new Date(endDate) : null);
        setModalVisible(true);
    };

    const handleApplyDateFilter = () => {
        if (tempStartDate && tempEndDate && tempStartDate > tempEndDate) {
            Alert.alert("Invalid Range", "Start date cannot be after end date.");
            return;
        }
        setStartDate(tempStartDate);
        setEndDate(tempEndDate);
        setModalVisible(false);
    };

    const handleClearFilters = () => {
        setLocationFilter('');
        setStartDate(null);
        setEndDate(null);
        setModalVisible(false); // Also close modal if open
        console.log('EventsScreen: Filters Cleared');
    };

    // --- Register Button Handler (Placeholder) ---
    const handleRegister = (eventId: number | undefined) => {
        if (!eventId) return;
        console.log(`EventsScreen: Registering for event ${eventId}`);
        Alert.alert("Registration", `Simulating registration for event ID: ${eventId}`);
        // TODO: Implement navigation to event details or registration flow
    };

    const cardWidth = '48%'; // Example for 2-column layout on wider screens

    const dateFilterButtonText = () => {
        if (startDate && endDate) return `Date: ${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`;
        if (startDate) return `Date: From ${formatDateDisplay(startDate)}`;
        if (endDate) return `Date: Until ${formatDateDisplay(endDate)}`;
        return 'Select Date Range';
    };

    // --- Render Logic ---
    if (isLoading && allEvents.length === 0) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContainer]}>
                <ActivityIndicator size="large" color={styles.colorAccent.color} />
                <Text style={styles.loadingText}>Loading Events...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <Text style={styles.pageTitle}>Upcoming Events</Text>

            {/* --- Filter Controls --- */}
            <View style={styles.filterContainer}>
                <TouchableOpacity style={styles.filterButton} onPress={openDateModal}>
                     <Feather name="calendar" size={16} color={styles.filterButtonText.color} />
                     <Text style={styles.filterButtonText} numberOfLines={1} ellipsizeMode='tail'>
                        {dateFilterButtonText()}
                    </Text>
                </TouchableOpacity>
                <TextInput
                    style={styles.locationInput}
                    placeholder="Filter by Location"
                    placeholderTextColor={styles.colorMutedText.color}
                    value={locationFilter}
                    onChangeText={setLocationFilter}
                />
                {(locationFilter || startDate || endDate) && (
                     <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
                        <Text style={styles.clearButtonText}>Clear</Text>
                     </TouchableOpacity>
                 )}
            </View>

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

                {!isLoading && !error && filteredEvents.length === 0 && (
                    <View style={styles.emptyStateContainer}>
                         <MaterialCommunityIcons name="calendar-search" size={64} color={styles.colorMutedText.color} />
                         <Text style={styles.emptyStateTitle}>No Events Found</Text>
                         <Text style={styles.emptyStateText}>
                             No events match your current filters. Try adjusting your search or clearing the filters.
                         </Text>
                         <TouchableOpacity style={styles.clearButtonLarge} onPress={handleClearFilters}>
                             <Text style={styles.clearButtonText}>View All Events</Text>
                         </TouchableOpacity>
                    </View>
                )}

                {!error && filteredEvents.length > 0 && (
                    <View style={styles.eventsGrid}>
                        {filteredEvents.map((event) => (
                            <View key={event.id ?? event.eventId} style={[styles.eventCard, { width: cardWidth }]}>
                                <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                                <Text style={styles.eventDescription} numberOfLines={3}>{event.description}</Text>
                                <View style={styles.eventDetailsContainer}>
                                    <View style={styles.eventDetailRow}>
                                        <Feather name="calendar" size={16} color={styles.iconColor.color} style={styles.detailIcon} />
                                        <Text style={styles.eventDetailText}>{formatFullDateTime(event.eventDate)}</Text>
                                    </View>
                                    {event.location && (
                                        <View style={styles.eventDetailRow}>
                                            <Feather name="map-pin" size={16} color={styles.iconColor.color} style={styles.detailIcon} />
                                            <Text style={styles.eventDetailText}>{event.location}</Text>
                                        </View>
                                    )}
                                    {(event.maxParticipants !== undefined) && (
                                        <View style={styles.eventDetailRow}>
                                            <Feather name="users" size={16} color={styles.iconColor.color} style={styles.detailIcon} />
                                            <Text style={styles.eventDetailText}>
                                                {event.currentParticipants !== undefined ? `${event.currentParticipants} / ` : ''}
                                                {event.maxParticipants > 0 ? `${event.maxParticipants} Attendees` : 'Unlimited'}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <TouchableOpacity style={styles.registerButton} onPress={() => handleRegister(event.id ?? event.eventId)}>
                                    <Text style={styles.registerButtonText}>Register / View Details</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Date Range Selection Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleClearFilters} // Or specific modal close handler
            >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
                    <TouchableOpacity style={styles.modalContent} activeOpacity={1} onPress={() => {}}>
                        <Text style={styles.modalTitle}>Select Date Range</Text>
                        <View style={styles.datePickerRow}>
                            <Text style={styles.datePickerLabel}>From:</Text>
                            <TouchableOpacity style={styles.dateDisplayButton} onPress={() => setShowPicker('start')}>
                                <Text style={styles.dateDisplayText}>{tempStartDate ? formatDateDisplay(tempStartDate) : 'Select Start'}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.datePickerRow}>
                            <Text style={styles.datePickerLabel}>To:</Text>
                            <TouchableOpacity style={styles.dateDisplayButton} onPress={() => setShowPicker('end')}>
                                <Text style={styles.dateDisplayText}>{tempEndDate ? formatDateDisplay(tempEndDate) : 'Select End'}</Text>
                            </TouchableOpacity>
                        </View>
                        {showPicker && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={(showPicker === 'start' ? tempStartDate : tempEndDate) || new Date()}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onDateChange}
                            />
                        )}
                        <View style={styles.modalFooter}>
                             <Button title="Clear Dates" onPress={() => {setTempStartDate(null); setTempEndDate(null);}} color={Platform.OS === 'ios' ? "#007AFF" : undefined}/>
                             <View style={{width: 10}}/>
                             <Button title="Cancel" onPress={() => setModalVisible(false)} color={Platform.OS === 'ios' ? "#FF3B30" : undefined}/>
                             <View style={{width: 10}}/>
                             <Button title="Apply" onPress={handleApplyDateFilter} />
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

// --- Styles (Reusing and adapting previous styles) ---
const styles = StyleSheet.create({
    // Core Colors
    colorPrimaryText: { color: '#1e293b' },
    colorSecondaryText: { color: '#64748b' },
    colorMutedText: { color: '#94a3b8' },
    colorBackground: { backgroundColor: '#f8fafc' },
    colorCardBackground: { backgroundColor: '#ffffff' },
    colorBorder: { borderColor: '#e2e8f0' },
    colorAccent: { color: '#2563eb' },
    iconColor: { color: '#64748b' },

    safeArea: { flex: 1, backgroundColor: '#f8fafc', },
    container: { flex: 1, },
    centerContainer: { justifyContent: 'center', alignItems: 'center', },
    loadingText: { marginTop: 10, fontSize: 16, color: '#64748b', },
    pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 20 : 10, paddingBottom: 10, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', },
    filterContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', gap: 10, },
    filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', flexShrink: 1, },
    filterButtonText: { color: '#334155', marginLeft: 6, fontSize: 14, fontWeight: '500', },
    locationInput: { flex: 1, backgroundColor: '#f1f5f9', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 14, color: '#1e293b', },
    clearButton: { backgroundColor: '#e0e7ff', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#a5b4fc', },
    clearButtonText: { color: '#3730a3', fontWeight: '500', fontSize: 14, },
    content: { flex: 1, },
    scrollContent: { padding: 16, paddingTop: 10, },
    eventsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', },
    eventCard: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1, }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2, },
    eventTitle: { fontSize: 17, fontWeight: '600', color: '#1e293b', marginBottom: 6, },
    eventDescription: { fontSize: 14, color: '#64748b', marginBottom: 12, lineHeight: 20, },
    eventDetailsContainer: { marginBottom: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12, },
    eventDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, },
    detailIcon: { marginRight: 8, },
    eventDetailText: { fontSize: 14, color: '#334155', flexShrink: 1, },
    registerButton: { backgroundColor: '#2563eb', paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 'auto', },
    registerButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '500', },
    emptyStateContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 30, },
    emptyStateTitle: { fontSize: 20, fontWeight: '600', color: '#1e293b', marginTop: 20, marginBottom: 10, textAlign: 'center', },
    emptyStateText: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 24, lineHeight: 22, },
    clearButtonLarge: { backgroundColor: '#e0e7ff', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, borderWidth: 1, borderColor: '#a5b4fc', },
    errorBox: { backgroundColor: '#fee2e2', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#fca5a5', marginBottom: 20, alignItems: 'center', },
    errorTextMsg: { fontSize: 14, color: '#b91c1c', textAlign: 'center', marginBottom: 10, },
    retryButton: { backgroundColor: '#ffffff', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6, borderWidth: 1, borderColor: '#fca5a5', },
    retryButtonText: { color: '#b91c1c', fontWeight: '500', },
    // Modal Styles
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)', },
    modalContent: { width: '90%', maxWidth: 400, backgroundColor: '#ffffff', borderRadius: 12, padding: 20, alignItems: 'stretch', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, },
    modalTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 20, textAlign: 'center', },
    datePickerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, justifyContent: 'space-between', },
    datePickerLabel: { fontSize: 16, color: '#334155', marginRight: 10, fontWeight: '500', },
    dateDisplayButton: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#f8fafc', borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', },
    dateDisplayText: { fontSize: 15, color: '#1e293b', },
    modalFooter: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#e2e8f0', },
});