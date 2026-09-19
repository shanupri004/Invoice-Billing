import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/Colors';
import BottomNav from '../components/BottomNav';
import { invoiceService } from '../services/invoiceService';
import {
  Wrench,
  BicepsFlexed,
  UserRound,
  Settings,
  FileText,
} from 'lucide-react-native';
import { useTranslation } from '../localization/LanguageContext';
import Text from '../components/AppText';

const getPercentChange = (current, previous) => {
  if (!previous) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const formatCurrency = amount =>
  `₹${Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;

export default function DashboardScreen({ navigation }) {
  const { t } = useTranslation();
  const formatChange = value => {
    const rounded = Math.round(value * 10) / 10;
    return t('dashboard.changeThisMonth', {
      value: `${rounded >= 0 ? '+' : ''}${rounded}`,
    });
  };
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  const loadInvoices = async () => {
    try {
      const data = await invoiceService.getAll();
      setInvoices(data);
    } catch (error) {
      console.log('Dashboard Load Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadInvoices();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadInvoices();
  };

  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonthDate = new Date(currentYear, currentMonthIndex - 1, 1);

  const isInMonth = (dateStr, monthIndex, year) => {
    const d = new Date(dateStr);
    return d.getMonth() === monthIndex && d.getFullYear() === year;
  };

  const currentMonthInvoices = invoices.filter(inv =>
    isInMonth(inv.invoiceDate, currentMonthIndex, currentYear)
  );
  const lastMonthInvoices = invoices.filter(inv =>
    isInMonth(inv.invoiceDate, lastMonthDate.getMonth(), lastMonthDate.getFullYear())
  );

  const totalRevenue = invoices.reduce(
    (sum, inv) => sum + Number(inv.totalAmount || 0),
    0
  );
  const currentMonthRevenue = currentMonthInvoices.reduce(
    (sum, inv) => sum + Number(inv.totalAmount || 0),
    0
  );
  const lastMonthRevenue = lastMonthInvoices.reduce(
    (sum, inv) => sum + Number(inv.totalAmount || 0),
    0
  );

  const invoiceCountChange = getPercentChange(
    currentMonthInvoices.length,
    lastMonthInvoices.length
  );
  const revenueChange = getPercentChange(currentMonthRevenue, lastMonthRevenue);

  const recentInvoices = invoices.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Fixed Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>{t('dashboard.title')}</Text>
              <Text style={styles.subtitle}>{t('dashboard.subtitle')}</Text>
            </View>

            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Settings size={26} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>

            <View style={styles.quickRow}>
              <TouchableOpacity
                style={styles.quickCard}
                onPress={() => navigation.navigate('InvoiceForm')}
              >
                <Wrench size={34} color={COLORS.primary} />
                <Text style={styles.quickText}>{t('dashboard.productInvoice')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickCard}
                onPress={() => navigation.navigate('LabourInvoiceForm')}
              >
                <BicepsFlexed size={34} color={COLORS.primary} />
                <Text style={styles.quickText}>{t('dashboard.labourInvoices')}</Text>
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>{t('dashboard.totalInvoices')}</Text>
                <Text style={styles.statValue}>{invoices.length}</Text>
                <Text
                  style={[
                    styles.statChange,
                    invoiceCountChange < 0 && styles.statChangeNegative,
                  ]}
                >
                  {formatChange(invoiceCountChange)}
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statLabel}>{t('dashboard.totalRevenue')}</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(totalRevenue)}
                </Text>
                <Text
                  style={[
                    styles.statChange,
                    revenueChange < 0 && styles.statChangeNegative,
                  ]}
                >
                  {formatChange(revenueChange)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.LongCard}
              onPress={() => navigation.navigate('customer')}
            >
              <UserRound size={34} color={COLORS.primary} />
              <Text style={styles.LongText}>{t('dashboard.customers')}</Text>
            </TouchableOpacity>

            {/* Monthly Summary */}
            <Text style={styles.sectionTitle}>{t('dashboard.monthlySummary')}</Text>

            <View style={styles.performanceCard}>
              <View style={styles.performanceHeader}>
                <Text style={styles.performanceTitle}>
                  {t('dashboard.performance', { month: currentMonth })}
                </Text>
              </View>

              <View style={styles.performanceRow}>
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceLabel}>{t('dashboard.totalInvoices')}</Text>
                  <Text style={styles.performanceValue}>
                    {currentMonthInvoices.length}
                  </Text>
                </View>

                <View style={styles.performanceItem}>
                  <Text
                    style={[styles.performanceLabel, { textAlign: 'right' }]}
                  >
                    {t('dashboard.totalRevenue')}
                  </Text>
                  <Text
                    style={[styles.performanceValue, { textAlign: 'right' }]}
                  >
                    {formatCurrency(currentMonthRevenue)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Recent Invoices */}
            <View style={styles.invoiceHeader}>
              <Text style={styles.sectionTitle}>{t('dashboard.recentInvoices')}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('InvoiceList')}
              >
                <Text style={styles.viewAll}>{t('dashboard.viewAll')}</Text>
              </TouchableOpacity>
            </View>

            {recentInvoices.length === 0 ? (
              <View style={styles.emptyContainer}>
                <FileText size={56} color="#D1D5DB" />
                <Text style={styles.emptyText}>{t('dashboard.noInvoicesYet')}</Text>
              </View>
            ) : (
              recentInvoices.map(item => {
                const method = item.paymentMode || item.paymentStatus;
                const isCash = item.paymentMode === 'Cash';
                const isPending = !item.paymentMode;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.invoiceCard}
                    onPress={() =>
                      navigation.navigate('previewInvoice', {
                        invoiceId: item.id,
                      })
                    }
                  >
                    <View>
                      <View style={styles.nameRow}>
                        <Text style={styles.invoiceName}>
                          {item.customer?.name || t('dashboard.unknownCustomer')}
                        </Text>
                        <View style={styles.typeBadge}>
                          <Text style={styles.typeBadgeText}>
                            {item.invoiceType}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.invoiceSub}>
                        #{item.billNo} •{' '}
                        {new Date(item.invoiceDate).toLocaleDateString(
                          'en-GB',
                          { day: '2-digit', month: 'short', year: 'numeric' }
                        )}
                      </Text>
                    </View>

                    <View style={styles.rightSection}>
                      <Text style={styles.invoiceAmount}>
                        {formatCurrency(item.totalAmount)}
                      </Text>

                      <View
                        style={[
                          styles.methodBadge,
                          isCash && styles.cashBadge,
                          !isCash && !isPending && styles.upiBadge,
                          isPending && styles.pendingBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.methodText,
                            isCash && styles.cashText,
                            !isCash && !isPending && styles.upiText,
                            isPending && styles.pendingText,
                          ]}
                        >
                          {method}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        )}

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

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#f4f6fb',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
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
  LongCard: {
    width: '100%',
    backgroundColor: '#fff',
    flexDirection: 'row', // important for horizontal layout
    alignItems: 'center',
    // justifyContent: 'space-aroun',
    gap: 16,
    borderRadius: 18,
    marginTop: 14,
    padding: 16, // add spacing inside
    elevation: 3,
  },
  LongText: {
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

  statChangeNegative: {
    color: '#dc2626',
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

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  invoiceName: {
    fontWeight: '700',
    fontSize: 20,
    color: '#111827',
    marginRight: 8,
  },

  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },

  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4b5563',
    letterSpacing: 0.5,
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

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '600',
  },

  /* Cash */

  cashBadge: {
    backgroundColor: '#d1fae5',
  },

  cashText: {
    color: '#047857',
  },

  /* UPI / Other modes */

  upiBadge: {
    backgroundColor: '#dbeafe',
  },

  upiText: {
    color: '#2563eb',
  },

  /* Pending */

  pendingBadge: {
    backgroundColor: '#fef3c7',
  },

  pendingText: {
    color: '#d97706',
  },
});
