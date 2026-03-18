import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { COLORS } from '../constants/Colors';
import BottomNav from '../components/BottomNav';
import { FileText, BarChart3 } from 'lucide-react-native';

export default function DashboardScreen({ navigation }) {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f6fb" />
      <View style={styles.container}>
        {/* Fixed Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Aadhi Engine Service</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>

          <View style={styles.quickRow}>
            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => navigation.navigate('InvoiceFlow')}
            >
              <FileText size={34} color={COLORS.primary} />
              <Text style={styles.quickText}>Create Invoice</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickCard}>
              <BarChart3 size={34} color={COLORS.primary} />
              <Text style={styles.quickText}>Reports</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Invoices</Text>
              <Text style={styles.statValue}>1,284</Text>
              <Text style={styles.statChange}>+12% this month</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Revenue</Text>
              <Text style={styles.statValue}>₹85.4k</Text>
              <Text style={styles.statChange}>+15.4% this month</Text>
            </View>
          </View>

          {/* Today Summary */}
          <Text style={styles.sectionTitle}>MONTHLY SUMMARY</Text>

          <View style={styles.performanceCard}>
            <View style={styles.performanceHeader}>
              <Text style={styles.performanceTitle}>
                {currentMonth} Performance
              </Text>
            </View>

            <View style={styles.performanceRow}>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Total Invoices</Text>
                <Text style={styles.performanceValue}>24</Text>
              </View>

              <View style={styles.performanceItem}>
                <Text style={[styles.performanceLabel, { textAlign: 'right' }]}>
                  Total Revenue
                </Text>
                <Text style={[styles.performanceValue, { textAlign: 'right' }]}>
                  ₹4,250
                </Text>
              </View>
            </View>
          </View>

          {/* Recent Invoices */}
          <View style={styles.invoiceHeader}>
            <Text style={styles.sectionTitle}>RECENT INVOICES</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {[
            {
              name: 'Rajesh Kumar',
              invoice: 'INV-0021',
              amount: '₹1,450.00',
              method: 'Cash',
            },
            {
              name: 'Suresh Raina',
              invoice: 'INV-0020',
              amount: '₹850.00',
              method: 'GPay',
            },
            {
              name: 'Anita Desai',
              invoice: 'INV-0019',
              amount: '₹2,100.00',
              method: 'Cash',
            },
          ].map((item, index) => (
            <View key={index} style={styles.invoiceCard}>
              <View>
                <Text style={styles.invoiceName}>{item.name}</Text>

                <Text style={styles.invoiceSub}>
                  #{item.invoice} • Oct 24, 2023
                </Text>
              </View>

              <View style={styles.rightSection}>
                <Text style={styles.invoiceAmount}>{item.amount}</Text>

                <View
                  style={[
                    styles.methodBadge,
                    item.method === 'GPay' && styles.upiBadge,
                    item.method === 'Cash' && styles.cashBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.methodText,
                      item.method === 'GPay' && styles.upiText,
                      item.method === 'Cash' && styles.cashText,
                    ]}
                  >
                    {item.method}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Navigation */}
        <BottomNav navigation={navigation} active="Home" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#f4f6fb',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },

  subtitle: {
    color: COLORS.secondary,
    marginTop: 4,
    fontSize: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 12,
    marginTop: 16,
  },

  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  quickCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 26,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 3,
  },

  quickText: {
    marginTop: 12,
    fontWeight: '600',
    fontSize: 18,
    textAlign: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 18,
    elevation: 3,
  },

  statLabel: {
    color: '#6b7280',
    fontSize: 16,
  },

  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 6,
  },

  statChange: {
    fontSize: 14,
    color: 'green',
  },

  performanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    padding: 26,
    marginTop: 14,
    elevation: 6,
  },

  performanceHeader: {
    marginBottom: 20,
  },

  performanceTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },

  performanceRow: {
    flexDirection: 'column',
    alignItems: 'left',
  },

  performanceItem: {
    flex: 1,
  },

  divider: {
    width: 1,
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 20,
  },

  performanceLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    marginBottom: 8,
  },

  performanceValue: {
    color: '#fff',
    fontSize: 46,
    fontWeight: 'bold',
  },

  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },

  viewAll: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },

  invoiceCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginTop: 14,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#eef2f7',

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  invoiceName: {
    fontWeight: '700',
    fontSize: 20,
    color: '#111827',
  },

  invoiceSub: {
    color: '#64748b',
    fontSize: 16,
    marginTop: 4,
  },

  rightSection: {
    alignItems: 'flex-end',
  },

  invoiceAmount: {
    fontWeight: '700',
    fontSize: 22,
    color: '#111827',
    marginBottom: 8,
  },

  methodBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },

  methodText: {
    fontSize: 14,
    fontWeight: '600',
  },

  /* Cash */

  cashBadge: {
    backgroundColor: '#d1fae5',
  },

  cashText: {
    color: '#047857',
  },

  /* UPI */

  upiBadge: {
    backgroundColor: '#dbeafe',
  },

  upiText: {
    color: '#2563eb',
  },
});
