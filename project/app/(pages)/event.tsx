import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    Modal,
    Platform, // Import Platform
    Button, // Using Button for simplicity in modal
} from 'react-native';
// Import DateTimePicker
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
// Import appropriate icons from Expo's vector icons
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// --- Mock Event Data (Remains the same) ---
const mockEvents = [
    { id: 'evt1', title: 'Plasturgy Innovation Seminar', description: '...', eventDate: '2024-10-15T09:00:00', location: 'Paris, France', capacity: 100, },
    { id: 'evt2', title: 'Sustainable Packaging Expo', description: '...', eventDate: '2024-11-05T10:30:00', location: 'Lyon, France', capacity: 250, },
    { id: 'evt3', title: 'Advanced Injection Molding Workshop', description: '...', eventDate: '2024-11-20T08:00:00', location: 'Marseille, France', capacity: 50, },
    { id: 'evt4', title: 'Recycling Technologies Conference', description: '...', eventDate: '2024-12-02T11:00:00', location: 'Paris, France', capacity: 150, },
    { id: 'evt5', title: 'Bioplastics & Sustainable Polymers Forum', description: '...', eventDate: '2025-01-10T09:30:00', location: 'Online', capacity: 500, },
];

// --- Helper to Format Date (Can be used for display) ---
const formatDateDisplay = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const formatFullDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, });
};

// Helper to compare dates ignoring time
const isDateInRange = (eventDateStr: string, startDate: Date | null, endDate: Date | null): boolean => {
    if (!startDate || !endDate) return true; // No range selected, include all

    const eventDate = new Date(eventDateStr);
    // Set time to 0 to compare dates only
    eventDate.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    return eventDate >= start && eventDate <= end;
};


// --- Main Component ---
const EventsScreen = () => {
    const [locationFilter, setLocationFilter] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [filteredEvents, setFilteredEvents] = useState(mockEvents);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
    const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
    const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null); // Which picker to show

    // --- Filtering Logic ---
    useEffect(() => {
        let events = mockEvents;

        // Apply Location Filter
        if (locationFilter) {
            events = events.filter(event =>
                event.location.toLowerCase().includes(locationFilter.toLowerCase())
            );
        }

        // Apply Date Range Filter
        if (startDate && endDate) {
            // Ensure start is before end before filtering
             if (startDate <= endDate) {
                events = events.filter(event => isDateInRange(event.eventDate, startDate, endDate));
            }
        }

        setFilteredEvents(events);
    }, [locationFilter, startDate, endDate]); // Re-run filter when filters change

    // --- Date Picker onChange Handler ---
    const onDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
        setShowPicker(null); // Hide picker immediately (especially needed for Android modal)

        if (event.type === 'set' && selectedDate) {
            if (showPicker === 'start') {
                setTempStartDate(selectedDate);
            } else if (showPicker === 'end') {
                setTempEndDate(selectedDate);
            }
        }
        // If 'dismissed' or no date, do nothing to temp dates
    };

    // --- Modal Actions ---
    const openDateModal = () => {
        // Initialize temp dates with current filter dates when opening
        setTempStartDate(startDate ? new Date(startDate) : null);
        setTempEndDate(endDate ? new Date(endDate) : null);
        setModalVisible(true);
    };

    const handleApplyDateFilter = () => {
        // Basic validation: Ensure start is not after end
        if (tempStartDate && tempEndDate && tempStartDate > tempEndDate) {
            alert("Start date cannot be after end date.");
            return;
        }
        setStartDate(tempStartDate);
        setEndDate(tempEndDate);
        setModalVisible(false);
    };

    const handleCancelModal = () => {
        setModalVisible(false);
        // No need to reset temp dates here, they'll be reset on next open
    };

    // --- Other Handlers ---
    const handleClearFilters = () => {
        setLocationFilter('');
        setStartDate(null);
        setEndDate(null);
        console.log('Filters Cleared');
    };

    const handleRegister = (eventId: string) => {
        console.log(`Registering for event ${eventId}`);
    };

    const cardWidth = '48%'; // Example width

    // --- Display text for the date filter button ---
    const dateFilterButtonText = () => {
        if (startDate && endDate) {
             if (startDate <= endDate) {
                 return `Date: ${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`;
             } else {
                 // Handle invalid range selection if needed, though Apply button should prevent this state
                 return 'Invalid Date Range';
             }
        }
        return 'Select Date Range';
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
                <Text style={styles.headerTitle}>Upcoming Events</Text>

                {/* --- Filter Controls --- */}
                <View style={styles.filterContainer}>
                    {/* Date Filter Button */}
                    <TouchableOpacity style={styles.filterButton} onPress={openDateModal}>
                         <Feather name="calendar" size={16} color={styles.filterButtonText.color} />
                         <Text style={styles.filterButtonText} numberOfLines={1} ellipsizeMode='tail'>
                            {dateFilterButtonText()}
                         </Text>
                    </TouchableOpacity>

                    {/* Location Filter Input */}
                    <TextInput
                        style={styles.locationInput}
                        placeholder="Filter by Location"
                        placeholderTextColor={styles.colorMutedText.color}
                        value={locationFilter}
                        onChangeText={setLocationFilter}
                    />

                    {/* Clear Filters Button */}
                    {(locationFilter || startDate || endDate) && ( // Only show if filters are active
                         <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
                            <Text style={styles.clearButtonText}>Clear</Text>
                         </TouchableOpacity>
                     )}
                </View>

                {/* --- Event Display Area (Remains Largely the Same) --- */}
                {filteredEvents.length > 0 ? (
                    <View style={styles.eventsGrid}>
                        {filteredEvents.map((event) => (
                            <View key={event.id} style={[styles.eventCard, { width: cardWidth }]}>
                                <Text style={styles.eventTitle}>{event.title}</Text>
                                <Text style={styles.eventDescription}>{event.description}</Text>
                                <View style={styles.eventDetailsContainer}>
                                    <View style={styles.eventDetailRow}>
                                        <Feather name="calendar" size={16} color={styles.colorSecondaryText.color} style={styles.detailIcon} />
                                        <Text style={styles.eventDetailText}>{formatFullDateTime(event.eventDate)}</Text>
                                    </View>
                                    <View style={styles.eventDetailRow}>
                                        <Feather name="map-pin" size={16} color={styles.colorSecondaryText.color} style={styles.detailIcon} />
                                        <Text style={styles.eventDetailText}>{event.location}</Text>
                                    </View>
                                    <View style={styles.eventDetailRow}>
                                        <Feather name="users" size={16} color={styles.colorSecondaryText.color} style={styles.detailIcon} />
                                        <Text style={styles.eventDetailText}>{event.capacity > 0 ? `${event.capacity} Attendees` : 'Unlimited Capacity'}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.registerButton} onPress={() => handleRegister(event.id)}>
                                    <Text style={styles.registerButtonText}>Register</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                ) : (
                    /* --- Empty State (Remains the Same) --- */
                    <View style={styles.emptyStateContainer}>
                         <MaterialCommunityIcons name="calendar-search" size={64} color={styles.colorMutedText.color} />
                         <Text style={styles.emptyStateTitle}>No Events Found</Text>
                         <Text style={styles.emptyStateText}>
                             No events match your current filters. Try adjusting your search or clearing the filters.
                         </Text>
                         <TouchableOpacity style={styles.clearButtonLarge} onPress={handleClearFilters}>
                             <Text style={styles.clearButtonText}>Clear Filters</Text>
                         </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* --- Date Range Selection Modal --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCancelModal} // For Android back button
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Date Range</Text>

                        {/* Start Date Selection */}
                        <View style={styles.datePickerRow}>
                            <Text style={styles.datePickerLabel}>From:</Text>
                            <TouchableOpacity style={styles.dateDisplayButton} onPress={() => setShowPicker('start')}>
                                <Text style={styles.dateDisplayText}>
                                    {tempStartDate ? formatDateDisplay(tempStartDate) : 'Select Start Date'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* End Date Selection */}
                         <View style={styles.datePickerRow}>
                            <Text style={styles.datePickerLabel}>To:</Text>
                            <TouchableOpacity style={styles.dateDisplayButton} onPress={() => setShowPicker('end')}>
                                <Text style={styles.dateDisplayText}>
                                    {tempEndDate ? formatDateDisplay(tempEndDate) : 'Select End Date'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* The Actual DateTimePicker Component */}
                        {showPicker && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={ (showPicker === 'start' ? tempStartDate : tempEndDate) ?? new Date() } // Provide a default value
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'} // 'spinner' on iOS looks nice in modal
                                onChange={onDateChange}
                                // Optional: Set minimum/maximum dates if needed
                                // minimumDate={new Date()}
                            />
                        )}

                        {/* Modal Buttons */}
                        <View style={styles.modalFooter}>
                             <TouchableOpacity style={styles.modalCancelButton} onPress={handleCancelModal}>
                                <Text style={styles.modalCancelButtonText}>Cancel</Text>
                             </TouchableOpacity>
                             <View style={{width: 10}}/>
                            <TouchableOpacity style={styles.modalApplyButton} onPress={handleApplyDateFilter}>
                                <Text style={styles.modalApplyButtonText}>Apply Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    // ... (Keep all previous styles: Core Colors, safeArea, container, headerTitle, filters, grid, card, empty state etc.) ...
    // Core Colors (reuse from previous theme)
    colorPrimaryText: { color: '#1e293b' },
    colorSecondaryText: { color: '#64748b' },
    colorMutedText: { color: '#94a3b8' },
    colorBackground: { backgroundColor: '#f8fafc' },
    colorCardBackground: { backgroundColor: '#ffffff' },
    colorBorder: { borderColor: '#e2e8f0' },
    colorAccent: { color: '#2563eb' },
    colorAccentBg: { backgroundColor: '#2563eb' },
    colorButtonTextLight: { color: '#ffffff'},
    colorSecondaryButtonBg: { backgroundColor: '#f1f5f9' },
    colorSecondaryButtonText: { color: '#334155'},


    safeArea: {
        flex: 1,
        backgroundColor: '#f8fafc', // Light Background
    },
    container: {
        flex: 1,
    },
    scrollContentContainer: {
        padding: 16,
        paddingBottom: 40, // Ensure scroll space
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b', // Primary Text
        marginBottom: 16,
        // fontFamily: 'Inter-SemiBold',
    },
    // Filter Styles
    filterContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff', // White background
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0', // Light border
        flexShrink: 0, // Allow button to shrink if text is long
        marginRight: 5, // Add slight margin if shrinking
    },
    filterButtonText: {
        color: '#334155', // Darker gray text
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '500',
        // fontFamily: 'Inter-Medium',
    },
    locationInput: {
        width: 150, // Fixed width
        flexShrink: 1,
        backgroundColor: '#ffffff',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        fontSize: 14,
        color: '#1e293b',
        // fontFamily: 'Inter-Regular',
    },
    clearButton: {
        backgroundColor: '#f1f5f9', // Light gray background
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginLeft: 5, // Space before clear button
    },
    clearButtonText: {
        color: '#334155', // Darker gray text
        fontWeight: '500',
        fontSize: 14,
        // fontFamily: 'Inter-Medium',
    },
    // Event Grid Styles
    eventsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between', // Creates space around items
    },
    // Event Card Styles
    eventCard: {
        backgroundColor: '#ffffff', // White card
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0', // Light border
        padding: 16,
        marginBottom: 16, // Space below cards
        // width: '48%', // Set dynamically or fixed for columns
    },
    eventTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 6,
    },
    eventDescription: {
        fontSize: 14,
        color: '#64748b', // Secondary text
        marginBottom: 16,
        lineHeight: 20,
    },
    eventDetailsContainer: {
        marginBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9', // Very light separator
        paddingTop: 16,
    },
    eventDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailIcon: {
        marginRight: 8,
    },
    eventDetailText: {
        fontSize: 14,
        color: '#334155', // Slightly darker secondary text
        flexShrink: 1, // Allow text to wrap if needed
    },
    // Register Button Styles
    registerButton: {
        backgroundColor: '#2563eb', // Accent blue
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 'auto', // Push button to bottom if card height varies
    },
    registerButtonText: {
        color: '#ffffff', // White text
        fontSize: 14,
        fontWeight: '500',
    },
    // Empty State Styles
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        marginTop: 40, // Add some space from filters
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1e293b',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 15,
        color: '#64748b', // Secondary text
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    clearButtonLarge: { // Reuse clear button style but maybe slightly larger padding
        backgroundColor: '#f1f5f9',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },

    // --- NEW Modal Styles ---
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darker overlay
    },
    modalContent: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: '#ffffff', // White background
        borderRadius: 12,
        padding: 20,
        alignItems: 'stretch', // Stretch items like buttons
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 20,
        textAlign: 'center',
    },
    datePickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        justifyContent: 'space-between',
    },
    datePickerLabel: {
        fontSize: 16,
        color: '#334155',
        marginRight: 10,
        fontWeight: '500',
    },
    dateDisplayButton: {
        flex: 1, // Take available space
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#f8fafc', // Light background for display
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center', // Center text inside
    },
    dateDisplayText: {
        fontSize: 15,
        color: '#1e293b',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 25, // More space before footer
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    modalCancelButton: {
       backgroundColor: '#f1f5f9',
       paddingVertical: 10,
       paddingHorizontal: 16,
       borderRadius: 8,
       borderWidth: 1,
       borderColor: '#e2e8f0',
    },
    modalCancelButtonText: {
       color: '#334155',
       fontWeight: '500',
    },
    modalApplyButton: {
       backgroundColor: '#2563eb', // Accent blue
       paddingVertical: 10,
       paddingHorizontal: 16,
       borderRadius: 8,
    },
    modalApplyButtonText: {
       color: '#ffffff',
       fontWeight: '500',
    }

});

export default EventsScreen;
