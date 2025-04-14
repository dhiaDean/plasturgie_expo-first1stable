import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    Modal,
    TextInput,
} from 'react-native';
// Import appropriate icons
import { Feather, FontAwesome5 } from '@expo/vector-icons'; // Using Feather and FontAwesome5

// --- Data Structures ---
interface SubscriptionFormData {
  planName: string;
  employeeCount: number | string; // Allow string during input
}

interface PlanFeature {
    id: string;
    text: string;
}

interface Plan {
    id: string;
    name: string;
    price: number;
    pricePeriod: string; // e.g., "/month"
    features: PlanFeature[];
    isCurrent?: boolean; // Flag if this is the user's current plan
}

interface CurrentSubscriptionDetails {
  id: number;
  planName: string;
  startDate: string; // ISO Date String
  endDate: string; // ISO Date String
  employeeCount: number;
  status: 'Active' | 'Expired' | 'Pending'; // Define possible statuses
  features: string[]; // Simple list of strings for current features
  price: number; // Current price being paid
}


// --- Mock Data ---
const currentSubscription: CurrentSubscriptionDetails = {
  id: 101,
  planName: "Enterprise Premium",
  startDate: "2024-05-15T00:00:00Z",
  endDate: "2025-05-14T23:59:59Z",
  employeeCount: 75,
  status: "Active",
  features: [
    "Access to all courses",
    "Unlimited certificates",
    "Priority email & phone support",
    "Weekly performance reports",
    "Customized learning paths",
  ],
  price: 599.99,
};

const availablePlans: Plan[] = [
  {
    id: 'plan_basic',
    name: "Enterprise Basic",
    price: 299.99,
    pricePeriod: "/month",
    features: [
        {id: 'f1', text: "Access to basic courses"},
        {id: 'f2', text: "10 certificates per month"},
        {id: 'f3', text: "Email support"},
        {id: 'f4', text: "Monthly performance reports"},
    ],
  },
  {
    id: 'plan_premium',
    name: "Enterprise Premium",
    price: 599.99,
    pricePeriod: "/month",
    features: [
        {id: 'f5', text: "Access to all courses"},
        {id: 'f6', text: "Unlimited certificates"},
        {id: 'f7', text: "Priority email & phone support"},
        {id: 'f8', text: "Weekly performance reports"},
        {id: 'f9', text: "Customized learning paths"},
    ],
    isCurrent: currentSubscription.planName === "Enterprise Premium", // Mark as current if names match
  },
  {
    id: 'plan_ultimate',
    name: "Enterprise Ultimate",
    price: 999.99,
    pricePeriod: "/month",
    features: [
        {id: 'f10', text: "Access to all courses & exclusive content"},
        {id: 'f11', text: "Unlimited certificates"},
        {id: 'f12', text: "24/7 dedicated support"},
        {id: 'f13', text: "Real-time performance dashboard"},
        {id: 'f14', text: "Customized learning paths"},
        {id: 'f15', text: "Private tutoring sessions"},
        {id: 'f16', text: "On-site training options"},
    ],
  },
];

// --- Helper Functions ---
const formatCurrency = (amount: number): string => `$${amount.toFixed(2)}`;
const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
         if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { return 'Error'; }
};

// Status Badge Styling & Component
const getStatusBadgeStyle = (status: CurrentSubscriptionDetails['status']) => {
  switch (status) {
    case "Active": return { bgColor: '#dcfce7', textColor: '#166534', bdColor: '#bbf7d0' }; // Green
    case "Expired": return { bgColor: '#fee2e2', textColor: '#991b1b', bdColor: '#fecaca' }; // Red
    case "Pending": return { bgColor: '#fef9c3', textColor: '#854d0e', bdColor: '#fef08a' }; // Yellow
    default: return { bgColor: '#f3f4f6', textColor: '#374151', bdColor: '#e5e7eb' }; // Gray
  }
};

const StatusBadge: React.FC<{ status: CurrentSubscriptionDetails['status'] }> = ({ status }) => {
     const styleInfo = getStatusBadgeStyle(status);
     return (
        <View style={[styles.badge, { backgroundColor: styleInfo.bgColor, borderColor: styleInfo.bdColor }]}>
            <Text style={[styles.badgeText, { color: styleInfo.textColor }]}>{status}</Text>
        </View>
     );
};

// --- Main Component ---
const SubscriptionsScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
    // Form State
    const [selectedPlan, setSelectedPlan] = useState<string>(currentSubscription.planName);
    const [employeeCount, setEmployeeCount] = useState<string>(currentSubscription.employeeCount.toString());
    const [formErrors, setFormErrors] = useState<{ plan?: string; count?: string }>({});


    // --- Modal and Form Handlers ---
    const openSubscriptionModal = () => {
        // Reset form to current subscription values when opening
        setSelectedPlan(currentSubscription.planName);
        setEmployeeCount(currentSubscription.employeeCount.toString());
        setFormErrors({}); // Clear previous errors
        setModalVisible(true);
    };

    const validateForm = (): boolean => {
        let errors: { plan?: string; count?: string } = {};
        const countNum = parseInt(employeeCount, 10);

        if (!selectedPlan) {
            errors.plan = "Please select a plan.";
        }
        if (!employeeCount) {
            errors.count = "Employee count is required.";
        } else if (isNaN(countNum) || countNum < 1) {
            errors.count = "Please enter a valid number (at least 1).";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0; // True if no errors
    };


    const handleFormSubmit = () => {
        if (!validateForm()) {
             console.log("Form validation failed:", formErrors);
             return; // Stop submission if validation fails
        }

        const formData: SubscriptionFormData = {
            planName: selectedPlan,
            employeeCount: parseInt(employeeCount, 10),
        };
        console.log('Submitting Subscription Update:', formData);
        // --- Add API call logic here ---
        // Example: await updateSubscriptionAPI(formData);
        setModalVisible(false); // Close modal on successful submission
    };

    // --- Render Functions ---

    // Render Feature Item with Checkmark
    const renderFeature = (featureText: string, key: string | number) => (
        <View style={styles.featureItem} key={key}>
            <Feather name="check-circle" size={16} color="#16a34a" style={styles.featureIcon} />
            <Text style={styles.featureText}>{featureText}</Text>
        </View>
    );

     // Render Plan Card for Available Plans
     const renderPlanCard = (plan: Plan) => {
        const isCurrent = plan.name === currentSubscription.planName; // Check if this is the current plan
        return (
            <View key={plan.id} style={[styles.planCard, isCurrent && styles.currentPlanCard]}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceContainer}>
                    <Text style={styles.planPrice}>{formatCurrency(plan.price)}</Text>
                    <Text style={styles.planPricePeriod}>{plan.pricePeriod}</Text>
                </View>
                <View style={styles.planFeaturesList}>
                    {plan.features.map(feature => renderFeature(feature.text, feature.id))}
                </View>
                <TouchableOpacity
                    style={[styles.choosePlanButton, isCurrent && styles.choosePlanButtonCurrent]}
                    onPress={() => {
                        setSelectedPlan(plan.name); // Pre-select this plan in modal
                        setEmployeeCount(currentSubscription.employeeCount.toString()); // Keep current count initially
                        setFormErrors({});
                        setModalVisible(true);
                    }}
                    disabled={isCurrent} // Disable button for the current plan
                >
                    <Text style={[styles.choosePlanButtonText, isCurrent && styles.choosePlanButtonTextCurrent]}>
                        {isCurrent ? 'Current Plan' : 'Choose Plan'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
     };


    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
                {/* --- Header --- */}
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.pageTitle}>Enterprise  </Text>
                        <TouchableOpacity style={styles.headerButton} onPress={openSubscriptionModal}>
                            <Text style={styles.headerButtonText}>Renew / Upgrade</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.pageTitle}>Subscriptions</Text>
                </View>

                {/* --- Current Subscription Card --- */}
                 <Text style={styles.sectionTitle}>Current Subscription</Text>
                <View style={styles.currentSubscriptionCard}>
                    {/* Header */}
                    <View style={styles.currentCardHeader}>
                        <View>
                            <Text style={styles.currentPlanName}>{currentSubscription.planName}</Text>
                            <Text style={styles.currentPlanPrice}>{formatCurrency(currentSubscription.price)} / month</Text>
                        </View>
                        <StatusBadge status={currentSubscription.status} />
                    </View>
                    {/* Details Grid */}
                    <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                            <Feather name="calendar" size={16} color={styles.iconColor.color} style={styles.detailIcon}/>
                            <View>
                                <Text style={styles.detailLabel}>Start Date</Text>
                                <Text style={styles.detailValue}>{formatDate(currentSubscription.startDate)}</Text>
                            </View>
                        </View>
                        <View style={styles.detailItem}>
                             <Feather name="calendar" size={16} color={styles.iconColor.color} style={styles.detailIcon}/>
                             <View>
                                <Text style={styles.detailLabel}>End Date</Text>
                                <Text style={styles.detailValue}>{formatDate(currentSubscription.endDate)}</Text>
                            </View>
                        </View>
                        <View style={styles.detailItem}>
                             <Feather name="users" size={16} color={styles.iconColor.color} style={styles.detailIcon}/>
                             <View>
                                <Text style={styles.detailLabel}>Employees</Text>
                                <Text style={styles.detailValue}>{currentSubscription.employeeCount}</Text>
                            </View>
                        </View>
                    </View>
                    {/* Features List */}
                     <View style={styles.featuresSection}>
                        <Text style={styles.featuresTitle}>Features:</Text>
                        {currentSubscription.features.map((feature, index) => renderFeature(feature, index))}
                    </View>
                     {/* Footer Button */}
                    <TouchableOpacity style={styles.currentCardButton} onPress={openSubscriptionModal}>
                        <Text style={styles.currentCardButtonText}>Renew / Upgrade Subscription</Text>
                    </TouchableOpacity>
                </View>


                {/* --- Available Plans Section --- */}
                 <View style={styles.availablePlansSection}>
                    <Text style={styles.sectionTitle}>Available Plans</Text>
                     {/* Vertical stack for mobile (replace with grid logic for web/tablet if needed) */}
                    <View style={styles.plansContainer}>
                         {availablePlans.map(renderPlanCard)}
                    </View>
                 </View>

            </ScrollView>

             {/* --- Subscription Modal --- */}
             <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Renew / Upgrade Subscription</Text>

                         {/* Plan Selection Simulation */}
                         <View style={styles.inputGroup}>
                             <Text style={styles.inputLabel}>Select Plan</Text>
                             <View style={styles.planSelectorContainer}>
                                 {availablePlans.map(plan => (
                                    <TouchableOpacity
                                        key={plan.id}
                                        style={[
                                            styles.planSelectButton,
                                            selectedPlan === plan.name && styles.planSelectButtonActive
                                        ]}
                                        onPress={() => setSelectedPlan(plan.name)}
                                    >
                                        <Text style={[
                                             styles.planSelectButtonText,
                                             selectedPlan === plan.name && styles.planSelectButtonTextActive
                                            ]}>{plan.name}</Text>
                                    </TouchableOpacity>
                                 ))}
                             </View>
                             {formErrors.plan && <Text style={styles.errorText}>{formErrors.plan}</Text>}
                         </View>


                         {/* Employee Count Input */}
                         <View style={styles.inputGroup}>
                             <Text style={styles.inputLabel}>Number of Employees</Text>
                             <TextInput
                                style={[styles.input, formErrors.count ? styles.inputError : null]}
                                placeholder="e.g., 50"
                                placeholderTextColor={styles.colorMutedText.color}
                                keyboardType="number-pad"
                                value={employeeCount}
                                onChangeText={(text) => setEmployeeCount(text.replace(/[^0-9]/g, ''))} // Allow only numbers
                             />
                              {formErrors.count && <Text style={styles.errorText}>{formErrors.count}</Text>}
                         </View>


                        {/* Modal Footer */}
                        <View style={styles.modalFooter}>
                             <TouchableOpacity style={styles.modalCancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalCancelButtonText}>Cancel</Text>
                             </TouchableOpacity>
                             <View style={{width: 10}}/>
                            <TouchableOpacity style={styles.modalSubmitButton} onPress={handleFormSubmit}>
                                <Text style={styles.modalSubmitButtonText}>Confirm Update</Text>
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
    // Core Colors
    colorPrimaryText: { color: '#1e293b' },
    colorSecondaryText: { color: '#64748b' },
    colorMutedText: { color: '#94a3b8' },
    colorBackground: { backgroundColor: '#f8fafc' },
    colorCardBackground: { backgroundColor: '#ffffff' },
    colorBorder: { borderColor: '#e2e8f0' },
    colorAccent: { color: '#2563eb' },
    colorAccentBg: { backgroundColor: '#2563eb' },
    colorError: { color: '#dc2626'}, // Red for errors
    colorSuccess: { color: '#16a34a'}, // Green for success checkmarks

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
    // Header Styles
    header: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
     headerButton: {
        backgroundColor: '#e0e7ff', // Light blue accent bg
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#a5b4fc',
    },
    headerButtonText: {
        color: '#1e3a8a', // Darker blue text
        fontWeight: '500',
        fontSize: 14,
    },
     sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 12,
        marginTop: 16, // Space above section titles
    },
    // Current Subscription Card Styles
    currentSubscriptionCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0', // Default border
        marginBottom: 24,
        overflow: 'hidden', // Clip button rounding
    },
    currentCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Align badge top-right
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    currentPlanName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    currentPlanPrice: {
        fontSize: 14,
        color: '#64748b',
    },
     // Badge Styles
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        marginLeft: 10, // Space from text
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allow wrapping if needed on very small screens
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        // Aim for 3 columns: Use percentage or fixed width. Percentage is more flexible.
        width: Platform.OS === 'web' ? '33.33%' : '100%', // Responsive width: 3 col web, 1 col mobile
        paddingVertical: 8,
        paddingRight: Platform.OS === 'web' ? 8 : 0, // Add paddingRight only for web grid spacing
    },
    detailIcon: {
        marginRight: 8,
    },
    detailLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#334155',
    },
    iconColor: { color: '#64748b' }, // For detail icons
    featuresSection: {
        padding: 16,
         borderBottomWidth: 1,
         borderBottomColor: '#f1f5f9',
    },
    featuresTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#334155',
        marginBottom: 10,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    featureIcon: {
        marginRight: 8,
    },
    featureText: {
        fontSize: 14,
        color: '#4b5563',
        flex: 1, // Allow text to wrap
    },
     currentCardButton: {
        backgroundColor: '#f8fafc', // Slightly off-white background
        paddingVertical: 14,
        alignItems: 'center',
    },
    currentCardButtonText: {
        color: '#334155',
        fontWeight: '500',
        fontSize: 14,
    },

    // Available Plans Styles
     availablePlansSection: {
        marginTop: 16,
    },
    plansContainer: {
        // Vertical stack by default for mobile
        // For a web/tablet grid: flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'
    },
     planCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 16,
        marginBottom: 16,
        // For web/tablet grid: width: '32%' // Adjust percentage for gaps
    },
    currentPlanCard: {
        borderColor: '#2563eb', // Primary blue border for current plan
        borderWidth: 2,
    },
     planName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginBottom: 16,
    },
    planPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    planPricePeriod: {
        fontSize: 14,
        color: '#64748b',
        marginLeft: 4,
        marginBottom: 2, // Align baseline better
    },
    planFeaturesList: {
        marginBottom: 16,
    },
     choosePlanButton: {
        backgroundColor: '#2563eb', // Primary button style
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    choosePlanButtonCurrent: {
        backgroundColor: '#f1f5f9', // Disabled/muted style for current plan
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    choosePlanButtonText: {
        color: '#ffffff',
        fontWeight: '500',
        fontSize: 14,
    },
    choosePlanButtonTextCurrent: {
        color: '#64748b', // Muted text color for current plan
    },

     // --- Modal Styles ---
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        maxWidth: 450, // Max width for modal
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'stretch',
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
    inputGroup: {
         marginBottom: 20,
    },
    inputLabel: {
         fontSize: 14,
         color: '#334155',
         marginBottom: 6,
         fontWeight: '500',
    },
    input: {
        backgroundColor: '#ffffff',
        color: '#1e293b',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    inputError: {
        borderColor: '#dc2626', // Red border for error
    },
    errorText: {
        color: '#dc2626', // Red error text
        fontSize: 12,
        marginTop: 4,
    },
    planSelectorContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allow buttons to wrap
        gap: 10, // Space between plan buttons
    },
    planSelectButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        backgroundColor: '#f8fafc',
    },
    planSelectButtonActive: {
        borderColor: '#2563eb', // Blue border when active
        backgroundColor: '#e0e7ff', // Light blue background when active
    },
    planSelectButtonText: {
        fontSize: 14,
        color: '#334155',
        fontWeight: '500',
    },
    planSelectButtonTextActive: {
        color: '#1e3a8a', // Darker blue text when active
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 24,
        paddingTop: 16,
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
    modalSubmitButton: {
       backgroundColor: '#2563eb',
       paddingVertical: 10,
       paddingHorizontal: 16,
       borderRadius: 8,
    },
    modalSubmitButtonText: {
       color: '#ffffff',
       fontWeight: '500',
    }
});

export default SubscriptionsScreen;
