import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    ScrollView, // Use ScrollView for the overview cards if needed
} from 'react-native';
// Import appropriate icons
import { MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';

// --- Data Structure ---
interface Payment {
  id: number;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  paymentDate: string; // ISO Date String
  status: 'Completed' | 'Pending' | 'Failed';
  description: string;
}

// --- Mock Payment Data ---
const mockPayments: Payment[] = [
  { id: 1, amount: 75.00, paymentMethod: "Visa **** 1234", transactionId: "txn_1LefgH...", paymentDate: "2024-11-10T10:05:00Z", status: "Completed", description: "Advanced Molding Course" },
  { id: 2, amount: 29.99, paymentMethod: "PayPal", transactionId: "txn_1Leabc...", paymentDate: "2024-11-01T15:30:00Z", status: "Completed", description: "Monthly Subscription" },
  { id: 3, amount: 150.00, paymentMethod: "Mastercard **** 5678", transactionId: "txn_1Ldxyz...", paymentDate: "2024-10-25T09:00:00Z", status: "Completed", description: "Recycling Tech Workshop" },
  { id: 4, amount: 29.99, paymentMethod: "PayPal", transactionId: "txn_1Lcghi...", paymentDate: "2024-10-01T15:31:00Z", status: "Failed", description: "Monthly Subscription" },
  { id: 5, amount: 50.00, paymentMethod: "Visa **** 1234", transactionId: "txn_1Lbklm...", paymentDate: "2024-09-15T11:00:00Z", status: "Completed", description: "Materials Science Ebook" },
  { id: 6, amount: 200.00, paymentMethod: "Bank Transfer", transactionId: "N/A", paymentDate: "2024-11-18T12:00:00Z", status: "Pending", description: "Enterprise Plan Setup" },
   { id: 7, amount: 29.99, paymentMethod: "PayPal", transactionId: "txn_1Lzkjh...", paymentDate: "2024-12-01T15:30:00Z", status: "Pending", description: "Monthly Subscription" },

];

// --- Helper Functions ---

// Currency Formatter
const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
};

// Date Formatter (e.g., MM/DD/YYYY)
const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-US', { // Use 'en-US' or undefined for locale default
             year: 'numeric', month: '2-digit', day: '2-digit'
        });
    } catch (e) { return 'Error'; }
};

// Status Badge Styling
const getStatusBadgeStyle = (status: Payment['status']) => {
  switch (status) {
    case "Completed":
      return {
        backgroundColor: '#dcfce7', // green-100
        textColor: '#166534',       // green-800
        borderColor: '#bbf7d0',     // green-200
      };
    case "Pending":
      return {
        backgroundColor: '#fef9c3', // yellow-100
        textColor: '#854d0e',       // yellow-800
        borderColor: '#fef08a',     // yellow-200
      };
    case "Failed":
      return {
        backgroundColor: '#fee2e2', // red-100
        textColor: '#991b1b',       // red-800
        borderColor: '#fecaca',     // red-200
      };
    default:
      return {
        backgroundColor: '#f3f4f6', // gray-100
        textColor: '#374151',       // gray-700
        borderColor: '#e5e7eb',     // gray-200
      };
  }
};

// Status Badge Component
const StatusBadge: React.FC<{ status: Payment['status'] }> = ({ status }) => {
     const styleInfo = getStatusBadgeStyle(status);
     return (
        <View style={[styles.badge, { backgroundColor: styleInfo.backgroundColor, borderColor: styleInfo.borderColor }]}>
            <Text style={[styles.badgeText, { color: styleInfo.textColor }]}>{status}</Text>
        </View>
     );
};

// --- Main Component ---
type TabType = 'History' | 'Overview';

const PaymentsScreen = () => {
    const [activeTab, setActiveTab] = useState<TabType>('History');

    // --- Calculate Overview Data ---
    const overviewData = useMemo(() => {
        let totalSpent = 0;
        let pendingAmount = 0;
        let pendingCount = 0;
        const paymentMethods = new Set<string>();

        mockPayments.forEach(p => {
            if (p.status === 'Completed') {
                totalSpent += p.amount;
            } else if (p.status === 'Pending') {
                pendingAmount += p.amount;
                pendingCount++;
            }
            paymentMethods.add(p.paymentMethod);
        });

        // Placeholder for percentage change
        const percentageChange = 5.2; // Example value

        return {
            totalSpent,
            percentageChange,
            pendingAmount,
            pendingCount,
            paymentMethodCount: paymentMethods.size,
        };
    }, [mockPayments]); // Recalculate if mockPayments changes


    // --- Render Functions ---

    // Render Filter Tab Button
    const renderFilterTab = (tabName: TabType) => {
        const isActive = activeTab === tabName;
        return (
            <TouchableOpacity
                key={tabName}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tabName)}
            >
                <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                    {tabName}
                </Text>
            </TouchableOpacity>
        );
    };

    // Render Payment History Row
    const renderPaymentRow = ({ item }: { item: Payment }) => {
        return (
             <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.descriptionCell]} numberOfLines={1}>{item.description}</Text>
                <Text style={[styles.tableCell, styles.amountCell]}>{formatCurrency(item.amount)}</Text>
                <Text style={[styles.tableCell, styles.methodCell]} numberOfLines={1}>{item.paymentMethod}</Text>
                <Text style={[styles.tableCell, styles.idCell]} numberOfLines={1}>{item.transactionId}</Text>
                <Text style={[styles.tableCell, styles.dateCell]}>{formatDate(item.paymentDate)}</Text>
                <Text style={[styles.tableCell, styles.statusCell]}>
                    <StatusBadge status={item.status} />
                </Text>
             </View>
        );
    };

     // Render Overview Summary Card
     const renderOverviewCard = (
        iconName: React.ComponentProps<typeof FontAwesome5>['name'],
        title: string,
        value: string,
        footerText?: string | React.ReactNode // Allow React Node for percentage change
     ) => {
        return (
            <View style={styles.overviewCard}>
                 <View style={styles.overviewCardHeader}>
                    <FontAwesome5 name={iconName} size={18} color={styles.colorSecondaryText.color} style={styles.overviewIcon} />
                    <Text style={styles.overviewCardTitle}>{title}</Text>
                 </View>
                 <Text style={styles.overviewCardValue}>{value}</Text>
                 {footerText && <Text style={styles.overviewCardFooter}>{footerText}</Text>}
            </View>
        );
     };


    return (
        <SafeAreaView style={styles.safeArea}>
             <View style={styles.headerContainer}>
                 <Text style={styles.headerTitle}>Payments</Text>
            </View>

             {/* --- Tab Navigation --- */}
            <View style={styles.tabsContainer}>
                {renderFilterTab('History')}
                {renderFilterTab('Overview')}
            </View>

             {/* --- Content Area --- */}
             <View style={styles.contentContainer}>
                {activeTab === 'History' && (
                    <View style={styles.tableContainer}>
                         {/* Table Header */}
                        <View style={styles.tableHeaderRow}>
                            <Text style={[styles.tableHeaderCell, styles.descriptionCell]}>Description</Text>
                            <Text style={[styles.tableHeaderCell, styles.amountCell]}>Amount</Text>
                            <Text style={[styles.tableHeaderCell, styles.methodCell]}>Method</Text>
                            <Text style={[styles.tableHeaderCell, styles.idCell]}>Transaction ID</Text>
                            <Text style={[styles.tableHeaderCell, styles.dateCell]}>Date</Text>
                            <Text style={[styles.tableHeaderCell, styles.statusCell]}>Status</Text>
                        </View>
                         {/* Table Body */}
                        <FlatList
                            data={mockPayments}
                            renderItem={renderPaymentRow}
                            keyExtractor={item => item.id.toString()}
                             ListEmptyComponent={() => (
                                <View style={styles.emptyListContainer}>
                                    <Text style={styles.emptyListText}>No payment history found.</Text>
                                </View>
                            )}
                        />
                    </View>
                )}

                {activeTab === 'Overview' && (
                    <ScrollView contentContainerStyle={styles.overviewContainer}>
                         {/* Total Spent Card */}
                         {renderOverviewCard(
                            "dollar-sign",
                            "Total Spent (Completed)",
                            formatCurrency(overviewData.totalSpent),
                            // Example for percentage change (adjust styling as needed)
                            <Text>
                                <Text style={{ color: overviewData.percentageChange >= 0 ? '#16a34a' : '#dc2626' }}>
                                     {overviewData.percentageChange >= 0 ? '+' : ''}{overviewData.percentageChange}%
                                </Text>
                                {' '} from previous period
                            </Text>
                         )}

                         {/* Pending Payments Card */}
                         {renderOverviewCard(
                            "receipt",
                            "Pending Payments",
                            formatCurrency(overviewData.pendingAmount),
                            `${overviewData.pendingCount} transaction(s)`
                         )}

                         {/* Payment Methods Card */}
                         {renderOverviewCard(
                            "credit-card",
                            "Payment Methods Used",
                            overviewData.paymentMethodCount.toString(), // Value is the count
                            `Unique method(s)`
                         )}
                    </ScrollView>
                )}
             </View>

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
    colorAccentBg: { backgroundColor: '#2563eb' },
    // ... other colors ...

    safeArea: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 10,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    // Tabs Styles
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#ffffff', // White background for tabs row
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    tabButton: {
        flex: 1, // Make tabs share width equally
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent', // Inactive tab has no underline
    },
    tabButtonActive: {
        borderBottomColor: '#2563eb', // Active tab underline color
    },
    tabButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#64748b', // Inactive text color
    },
    tabButtonTextActive: {
        color: '#1e3a8a', // Active text color (darker blue)
    },
    contentContainer: {
        flex: 1, // Takes remaining space below tabs
    },
    // Table Styles
    tableContainer: {
        flex: 1,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc', // Light background for header
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    tableHeaderCell: {
        color: '#64748b', // Secondary Text for headers
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'left',
        // flex: 1, // Default flex for equal width, override below
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9', // Lighter row separator
        paddingVertical: 14,
        paddingHorizontal: 10,
        backgroundColor: '#ffffff', // White row background
        alignItems: 'center', // Center items vertically in row
    },
    tableCell: {
        fontSize: 13,
        color: '#334155', // Slightly darker secondary text
        textAlign: 'left',
        // flex: 1, // Default flex, override below
    },
    // Specific column widths using flex
    descriptionCell: { flex: 3, paddingRight: 5 },
    amountCell: { flex: 1.5, textAlign: 'right', paddingRight: 10, fontWeight: '500' },
    methodCell: { flex: 2, paddingHorizontal: 5 },
    idCell: { flex: 2, paddingHorizontal: 5 },
    dateCell: { flex: 1.5, textAlign: 'center' },
    statusCell: { flex: 1.5, alignItems: 'center', justifyContent: 'center'}, // Center badge

     // Badge Styles (already used by StatusBadge component)
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
        alignSelf: 'flex-start', // Prevent stretching
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '500',
    },
     emptyListContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
        marginTop: 50,
    },
    emptyListText: {
        fontSize: 15,
        color: '#64748b',
    },
    // Overview Styles
    overviewContainer: {
        padding: 16,
    },
    overviewCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    overviewCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    overviewIcon: {
        marginRight: 10,
    },
    overviewCardTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#334155',
    },
    overviewCardValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    overviewCardFooter: {
        fontSize: 13,
        color: '#64748b',
    },
});

export default PaymentsScreen;
