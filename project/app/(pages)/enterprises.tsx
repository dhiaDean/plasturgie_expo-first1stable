import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Button, // Using Button for simplicity in modal
  Platform, // For platform-specific styling
} from 'react-native';
// Use appropriate icons. Lucide icons might require an extra library (`lucide-react-native`)
// Let's stick to @expo/vector-icons for broad compatibility unless you specifically have lucide setup.
import { FontAwesome, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

// --- Mock Data (Remains the same) ---
const enterprise = {
  id: 1,
  companyName: 'PlastTech Industries',
  address: '123 Innovation Drive, Polymer Park, CA 94103',
  contactNumber: '+1 (555) 987-6543',
};

const subscriptions = [
  {
    id: 1,
    planName: 'Enterprise Basic',
    startDate: '2025-01-15',
    endDate: '2025-07-15',
    employeeCount: 25,
    status: 'Active',
  },
  {
    id: 2,
    planName: 'Enterprise Premium',
    startDate: '2024-07-10',
    endDate: '2025-01-10',
    employeeCount: 50,
    status: 'Expired',
  },
];

// --- Helper Function for Status Badge Styling (Light Theme) ---
const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'Active':
      return {
        backgroundColor: '#dcfce7', // Tailwind green-100 (Approx)
        textColor: '#15803d',       // Tailwind green-700 (Approx)
        borderColor: '#86efac',     // Tailwind green-300 (Approx)
      };
    case 'Expired':
      return {
        backgroundColor: '#fee2e2', // Tailwind red-100 (Approx)
        textColor: '#b91c1c',       // Tailwind red-700 (Approx)
        borderColor: '#fca5a5',     // Tailwind red-300 (Approx)
      };
    case 'Pending':
      return {
        backgroundColor: '#fef3c7', // Tailwind yellow-100 (Approx)
        textColor: '#a16207',       // Tailwind yellow-700 (Approx)
        borderColor: '#fcd34d',     // Tailwind yellow-300 (Approx)
      };
    default:
      return {
        backgroundColor: '#f3f4f6', // Tailwind gray-100 (Approx)
        textColor: '#4b5563',       // Tailwind gray-600 (Approx)
        borderColor: '#d1d5db',     // Tailwind gray-300 (Approx)
      };
  }
};

// --- Main Component ---
const EnterprisesScreenLight = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [planName, setPlanName] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');

  const handleAddSubscription = () => {
    if (!planName || !employeeCount || isNaN(Number(employeeCount)) || Number(employeeCount) < 1) {
        alert('Please enter a valid Plan Name and Employee Count (at least 1).');
        return;
    }
    console.log('Adding Subscription:', { planName, employeeCount: Number(employeeCount) });
    setPlanName('');
    setEmployeeCount('');
    setModalVisible(false);
  };

  // --- Render Helper for Subscription Rows ---
  const renderSubscriptionRow = (subscription) => {
    const badgeStyle = getStatusBadgeStyle(subscription.status);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

    return (
        <View style={styles.tableRow} key={subscription.id}>
            <Text style={[styles.tableCell, styles.tableCellFlex2, styles.textPrimary]}>{subscription.planName}</Text>
            <Text style={[styles.tableCell, styles.tableCellFlex1, styles.textSecondary]}>{formatDate(subscription.startDate)}</Text>
            <Text style={[styles.tableCell, styles.tableCellFlex1, styles.textSecondary]}>{formatDate(subscription.endDate)}</Text>
            <Text style={[styles.tableCell, styles.tableCellFlex1, styles.textSecondary, styles.textCenter]}>{subscription.employeeCount}</Text>
            <View style={[styles.tableCell, styles.tableCellFlex1, styles.statusCellContainer]}>
                <View style={[styles.badge, { backgroundColor: badgeStyle.backgroundColor, borderColor: badgeStyle.borderColor }]}>
                    <Text style={[styles.badgeText, { color: badgeStyle.textColor }]}>{subscription.status}</Text>
                </View>
            </View>
        </View>
    );
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
        {/* --- Header --- */}
        <View style={styles.header}>
  <View style={{ flex: 1 }}>
    <Text style={styles.headerTitle}>Entreprise</Text>
    <Text style={styles.headerTitle}>Management</Text>
  </View>
  <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
    <FontAwesome name="plus" size={14} color="#FFFFFF" style={styles.addButtonIcon} />
    <Text style={styles.addButtonText}>Add Subscription</Text>
  </TouchableOpacity>
</View>


        {/* --- Enterprise Details Card --- */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            {/* Using FontAwesome5 for Building Icon */}
            <FontAwesome5 name="building" size={18} color="#2563eb" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Enterprise Details</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.detailRow}>
                 <View style={styles.detailItem}>
                     <Text style={styles.detailLabel}>Company Name</Text>
                     <Text style={styles.detailValue}>{enterprise.companyName}</Text>
                 </View>
                  <View style={styles.detailItem}>
                     <Text style={styles.detailLabel}>Contact Number</Text>
                     <Text style={styles.detailValue}>{enterprise.contactNumber}</Text>
                 </View>
            </View>
            <View style={styles.detailItemFull}>
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={styles.detailValue}>{enterprise.address}</Text>
            </View>
          </View>
        </View>

        {/* --- Subscription History --- */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Subscription History</Text>

          {subscriptions.length > 0 ? (
            <View style={styles.tableContainer}>
              {/* Table Header */}
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, styles.tableCellFlex2]}>Plan Name</Text>
                <Text style={[styles.tableHeaderCell, styles.tableCellFlex1]}>Start Date</Text>
                <Text style={[styles.tableHeaderCell, styles.tableCellFlex1]}>End Date</Text>
                <Text style={[styles.tableHeaderCell, styles.tableCellFlex1, styles.textCenter]}>Employees</Text>
                <Text style={[styles.tableHeaderCell, styles.tableCellFlex1, styles.textCenter]}>Status</Text>
              </View>
              {/* Table Body */}
              {subscriptions.map(renderSubscriptionRow)}
            </View>
          ) : (
            <View style={styles.noSubscriptions}>
              {/* Using MaterialCommunityIcons for a placeholder icon */}
              <MaterialCommunityIcons name="file-document-outline" size={64} color="#94a3b8" />
              <Text style={styles.noSubscriptionsTitle}>No subscription history</Text>
              <Text style={styles.noSubscriptionsText}>Add a subscription using the button above.</Text>
            </View>
          )}
        </View>
      </ScrollView>

       {/* --- Add Subscription Modal --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Subscription</Text>
            <Text style={styles.modalDescription}>
              Create a new subscription for your enterprise.
            </Text>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Plan Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter plan name"
                    placeholderTextColor="#94a3b8" // Lighter placeholder
                    value={planName}
                    onChangeText={setPlanName}
                 />
            </View>

             <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Employee Count</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter number of employees"
                    placeholderTextColor="#94a3b8" // Lighter placeholder
                    keyboardType="number-pad"
                    value={employeeCount}
                    onChangeText={setEmployeeCount}
                />
            </View>

            <View style={styles.modalFooter}>
                {/* Simple Cancel Button - Consider styling TouchableOpacity for better look */}
               <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCancelButton}>
                   <Text style={styles.modalCancelButtonText}>Cancel</Text>
               </TouchableOpacity>
               <View style={{ width: 10 }} />
               {/* Primary Add Button */}
               <TouchableOpacity onPress={handleAddSubscription} style={styles.modalAddButton}>
                   <Text style={styles.modalAddButtonText}>Add Subscription</Text>
               </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

// --- Styles (Adapted to Light Theme based on CertificatesScreen) ---
const styles = StyleSheet.create({
  // Core Colors
  colorPrimaryText: '#1e293b', // Dark Slate Gray
  colorSecondaryText: '#64748b', // Lighter Slate Gray
  colorMutedText: '#94a3b8', // Even Lighter Gray
  colorBackground: '#f8fafc', // Light Background
  colorCardBackground: '#ffffff', // White
  colorBorder: '#e2e8f0', // Light Gray Border
  colorAccent: '#2563eb', // Blue

  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc', // Light Background
  },
  container: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16, // Consistent padding
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24, // More space below header
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold', // Or '600' if using custom fonts mapped
    color: '#1e293b', // Primary Text
    // fontFamily: 'Inter-SemiBold', // If using Inter font
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb', // Accent Blue
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
   addButtonIcon: {
     marginRight: 8,
  },
  addButtonText: {
    color: '#ffffff', // White text on blue button
    fontSize: 14,
    fontWeight: '500', // Medium weight
    // fontFamily: 'Inter-Medium', // If using Inter font
  },
  // Card Styles
  card: {
    backgroundColor: '#ffffff', // White card
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0', // Light border
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0', // Separator border
  },
   cardIcon: {
     marginRight: 10,
     color: '#2563eb', // Accent color for icon
  },
  cardTitle: {
    fontSize: 17, // Slightly larger
    fontWeight: '600', // Semi-bold
    color: '#1e293b', // Primary Text
    // fontFamily: 'Inter-SemiBold', // If using Inter font
  },
  cardContent: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12, // Consistent spacing
    flexWrap: 'wrap',
  },
  detailItem: {
      flexBasis: '48%',
      marginBottom: 10,
  },
   detailItemFull: {
      flexBasis: '100%',
      marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b', // Secondary Text
    marginBottom: 4,
    fontWeight: '500',
    // fontFamily: 'Inter-Medium', // If using Inter font
  },
  detailValue: {
    fontSize: 15,
    color: '#1e293b', // Primary Text
    fontWeight: '400', // Regular weight
    // fontFamily: 'Inter-Regular', // If using Inter font
  },
  // History Section Styles
  historySection: {
    marginTop: 10,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '600', // Semi-bold
    color: '#1e293b', // Primary Text
    marginBottom: 16,
    // fontFamily: 'Inter-SemiBold', // If using Inter font
  },
  // Table Styles
  tableContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0', // Light Border
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff', // White background for table area
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc', // Very light background for header
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableHeaderCell: {
    color: '#64748b', // Secondary Text for headers
    fontSize: 12,
    fontWeight: '600', // Header text slightly bolder
    textAlign: 'left',
    textTransform: 'uppercase', // Uppercase headers are common
    // fontFamily: 'Inter-SemiBold', // If using Inter font
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0', // Row separator
    paddingVertical: 14, // Slightly more padding in rows
    paddingHorizontal: 10,
     backgroundColor: '#ffffff', // Ensure row background is white
  },
  // Selectively remove border from last row if needed (can be done via logic in map)
  tableCell: {
    fontSize: 14,
    textAlign: 'left',
    // fontFamily: 'Inter-Regular', // If using Inter font
  },
  textPrimary: { // For main data like Plan Name
    color: '#1e293b',
    fontWeight: '500', // Slightly bolder
  },
  textSecondary: { // For dates, counts etc.
      color: '#334155', // Slightly darker than label gray
  },
  tableCellFlex1: { flex: 1 },
  tableCellFlex2: { flex: 2 },
  textCenter: { textAlign: 'center' },
  statusCellContainer: { alignItems: 'center' },

  // Badge Styles (Light Theme)
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12, // Pill shape
    borderWidth: 1,
    alignSelf: 'flex-start', // Keep it neat
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500', // Medium weight
    // fontFamily: 'Inter-Medium', // If using Inter font
  },
  // No Subscriptions Placeholder Styles
  noSubscriptions: {
    borderWidth: 1,
    borderColor: '#e2e8f0', // Light border
    borderStyle: 'dashed', // Dashed border often used for empty states
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff', // White background
    minHeight: 150,
  },
   noSubscriptionsTitle: {
    // fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  noSubscriptionsText: {
    // fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b', // Secondary text
    textAlign: 'center',
    marginBottom: 24,
  },

  // Modal Styles (Light Theme)
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Slightly lighter overlay
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#ffffff', // White modal background
    borderRadius: 12,
    padding: 20,
    alignItems: 'stretch',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, // Lighter shadow for light theme
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b', // Primary Text
    marginBottom: 8,
    textAlign: 'center',
     // fontFamily: 'Inter-SemiBold', // If using Inter font
  },
  modalDescription: {
      fontSize: 14,
      color: '#64748b', // Secondary Text
      marginBottom: 20,
      textAlign: 'center',
      // fontFamily: 'Inter-Regular', // If using Inter font
  },
  inputGroup: {
      marginBottom: 15,
  },
  inputLabel: {
      fontSize: 14,
      color: '#334155', // Slightly darker label
      marginBottom: 6,
      fontWeight: '500',
      // fontFamily: 'Inter-Medium', // If using Inter font
  },
  input: {
    backgroundColor: '#ffffff', // White input background
    color: '#1e293b', // Primary text color for input
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12, // Comfortable height
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#cbd5e1', // Tailwind slate-300 (common input border)
    // fontFamily: 'Inter-Regular', // If using Inter font
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0', // Light border separator
  },
   modalCancelButton: {
       backgroundColor: '#f1f5f9', // Light gray background for cancel/secondary button
       paddingVertical: 10,
       paddingHorizontal: 16,
       borderRadius: 8,
       borderWidth: 1,
       borderColor: '#e2e8f0',
   },
   modalCancelButtonText: {
       color: '#334155', // Darker gray text
       fontWeight: '500',
       // fontFamily: 'Inter-Medium', // If using Inter font
   },
   modalAddButton: {
       backgroundColor: '#2563eb', // Accent blue
       paddingVertical: 10,
       paddingHorizontal: 16,
       borderRadius: 8,
   },
   modalAddButtonText: {
       color: '#ffffff',
       fontWeight: '500',
       // fontFamily: 'Inter-Medium', // If using Inter font
   }
});

export default EnterprisesScreenLight;
