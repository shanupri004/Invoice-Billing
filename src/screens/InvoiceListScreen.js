import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Plus, Search, User, Filter, Calendar, X } from 'lucide-react-native';
import { invoiceService } from '../services/invoiceService';
import BottomNav from '../components/BottomNav';
import DateTimePicker from '@react-native-community/datetimepicker';
import {COLORS} from '../constants/Colors';

const SkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonCardHeader}>
      <View style={styles.skeletonCodeRow}>
        <View style={[styles.skeletonLine, { width: 100, height: 20, marginBottom: 8 }]} />
        <View style={[styles.skeletonLine, { width: 60, height: 16 }]} />
      </View>
      <View style={[styles.skeletonLine, { width: 80, height: 36 }]} />
    </View>
    <View style={styles.skeletonCustomerSection}>
      <View style={[styles.skeletonCircle, { width: 38, height: 38 }]} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <View style={[styles.skeletonLine, { width: 120, height: 16, marginBottom: 6 }]} />
        <View style={[styles.skeletonLine, { width: 80, height: 14 }]} />
      </View>
    </View>
    <View style={[styles.skeletonLine, { width: '100%', height: 40, marginBottom: 12 }]} />
    <View style={[styles.skeletonLine, { width: '100%', height: 1 }]} />
  </View>
);

const InvoiceListScreen = ({ navigation }) => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: null,
    endDate: null,
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [localStartDate, setLocalStartDate] = useState(new Date());
  const [localEndDate, setLocalEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const loadInvoices = async () => {
    try {
      const data = await invoiceService.getAll();
      console.log('Loaded Invoices:', data);
      setInvoices(data);
      setFilteredInvoices(data);
    } catch (error) {
      console.log('Invoice Load Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    let data = [...invoices];

    if (statusFilter !== 'ALL') {
      data = data.filter(
        item =>
          item.paymentStatus?.toUpperCase() === statusFilter.toUpperCase()
      );
    }

    if (invoiceTypeFilter !== 'ALL') {
      data = data.filter(
        item =>
          item.invoiceType?.toUpperCase() === invoiceTypeFilter.toUpperCase()
      );
    }

    if (dateRangeFilter.startDate || dateRangeFilter.endDate) {
      data = data.filter(item => {
        const invoiceDate = new Date(item.invoiceDate);
        const startDate = dateRangeFilter.startDate
          ? new Date(dateRangeFilter.startDate)
          : null;
        const endDate = dateRangeFilter.endDate
          ? new Date(dateRangeFilter.endDate)
          : null;

        if (startDate && invoiceDate < startDate) return false;
        if (endDate && invoiceDate > endDate) return false;
        return true;
      });
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      data = data.filter(item => {
        const matchesInvoiceCode = item.invoiceCode?.toLowerCase().includes(searchLower);
        const matchesCustomerId = String(item.customerId).toLowerCase().includes(searchLower);
        const matchesCustomerName = item.customer?.name?.toLowerCase().includes(searchLower);
        const matchesMobile = item.customer?.mobile?.toString().includes(searchLower);
        
        return matchesInvoiceCode || matchesCustomerId || matchesCustomerName || matchesMobile;
      });
    }

    setFilteredInvoices(data);
  }, [search, statusFilter, invoiceTypeFilter, dateRangeFilter, invoices]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInvoices();
  }, []);

  const handleApplyDateFilter = () => {
    const startDate = localStartDate;
    const endDate = localEndDate;
    
    setDateRangeFilter({ startDate, endDate });
    setShowFilterModal(false);
  };

  const handleClearFilters = () => {
    setStatusFilter('ALL');
    setInvoiceTypeFilter('ALL');
    setDateRangeFilter({ startDate: null, endDate: null });
    setSearch('');
    setLocalStartDate(new Date());
    setLocalEndDate(new Date());
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setLocalStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setLocalEndDate(selectedDate);
    }
  };

  const renderInvoice = ({ item }) => {
    const grandTotal = item.items?.reduce(
      (total, current) => total + current.qty * current.unitPrice,
      0
    );
    
    return (
      <TouchableOpacity
        style={styles.invoiceCard}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('previewInvoice', {
            invoiceId: item.id,
          })
        }
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={styles.codeRow}>
              <Text style={styles.invoiceCode}>{item.invoiceCode}</Text>
              <View
                style={[
                  styles.badge,
                  item.paymentStatus === 'PAID'
                    ? styles.paidBadge
                    : styles.pendingBadge,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    item.paymentStatus === 'PAID'
                      ? styles.paidText
                      : styles.pendingText,
                  ]}
                >
                  {item.paymentStatus}
                </Text>
              </View>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{item.invoiceType}</Text>
              </View>
            </View>

            <Text style={styles.invoiceDate}>
              {new Date(item.invoiceDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.amountPill}>
            <Text style={styles.amountLabel}>Total</Text>
            <Text style={styles.amountText}>
              ₹{Number(grandTotal).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.customerSection}>
          <View style={styles.avatarCircle}>
            <User size={18} color={COLORS.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.customerName} numberOfLines={1}>
              {item.customer?.name || 'Unknown Customer'}
            </Text>
            <Text style={styles.mobileText} numberOfLines={1}>
              {item.customer?.mobile || '-'}
            </Text>
          </View>
        </View>

        <View style={styles.itemPreview}>
          <Text style={styles.itemPreviewTitle}>Items</Text>
          <Text style={styles.itemPreviewValue}>
            {item.items?.length || 0} item
            {(item.items?.length || 0) !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.bottomRow}>
          <Text style={styles.bottomHint}>Tap to view invoice details</Text>
          <Text style={styles.arrowText}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={80} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Invoices Found</Text>
      <Text style={styles.emptySubtitle}>
        {invoices.length === 0
          ? 'Create your first invoice to get started.'
          : 'Try adjusting your filters or search query.'}
      </Text>
      {invoices.length > 0 && (
        <TouchableOpacity
          style={styles.clearFiltersButton}
          onPress={handleClearFilters}
        >
          <Text style={styles.clearFiltersText}>Clear All Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <View style={[styles.skeletonLine, { flex: 1, marginLeft: 10, height: 20 }]} />
        </View>

        <View style={styles.filterRow}>
          <View style={[styles.skeletonLine, { width: 100, height: 38 }]} />
        </View>

        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={(_, index) => index.toString()}
          renderItem={() => <SkeletonCard />}
          contentContainerStyle={{ paddingBottom: 120 }}
        />

        <BottomNav navigation={navigation} active="Invoices" />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('InvoiceForm')}
        >
          <Plus size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" />
        <TextInput
          placeholder="Search by code, customer, or mobile..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor={"black"}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <X size={18} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={18} color={COLORS.primary} />
          <Text style={styles.filterButtonText}>Filters</Text>
          {(statusFilter !== 'ALL' || invoiceTypeFilter !== 'ALL' || dateRangeFilter.startDate || dateRangeFilter.endDate) && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>•</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Invoice List */}
      <FlatList
        data={filteredInvoices}
        keyExtractor={item => item.id.toString()}
        renderItem={renderInvoice}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={<EmptyComponent />}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('InvoiceForm')}
      >
        <Plus size={30} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <BottomNav navigation={navigation} active="Invoices" />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowFilterModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Filters</Text>
                  <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                    <X size={24} color="#374151" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {/* Payment Status */}
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Payment Status</Text>
                    <View style={styles.filterOptions}>
                      {['ALL', 'PAID', 'PENDING'].map(status => (
                        <TouchableOpacity
                          key={status}
                          onPress={() => setStatusFilter(status)}
                          style={[
                            styles.filterOption,
                            statusFilter === status && styles.activeFilterOption,
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterOptionText,
                              statusFilter === status && styles.activeFilterOptionText,
                            ]}
                          >
                            {status}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Invoice Type */}
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Invoice Type</Text>
                    <View style={styles.filterOptions}>
                      {['ALL', 'PRODUCT', 'SERVICE'].map(type => (
                        <TouchableOpacity
                          key={type}
                          onPress={() => setInvoiceTypeFilter(type)}
                          style={[
                            styles.filterOption,
                            invoiceTypeFilter === type && styles.activeFilterOption,
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterOptionText,
                              invoiceTypeFilter === type && styles.activeFilterOptionText,
                            ]}
                          >
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Date Range */}
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Date Range</Text>
                    
                    {/* Start Date */}
                    <View style={styles.dateInput}>
                      <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowStartDatePicker(true)}
                      >
                        <Calendar size={18} color={COLORS.primary} />
                        <Text style={styles.datePickerText}>
                          {localStartDate.toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                      </TouchableOpacity>
                      {showStartDatePicker && (
                        <DateTimePicker
                          value={localStartDate}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={onStartDateChange}
                        />
                      )}
                    </View>

                    {/* End Date */}
                    <View style={styles.dateInput}>
                      <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowEndDatePicker(true)}
                      >
                        <Calendar size={18} color={COLORS.primary} />
                        <Text style={styles.datePickerText}>
                          {localEndDate.toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                      </TouchableOpacity>
                      {showEndDatePicker && (
                        <DateTimePicker
                          value={localEndDate}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={onEndDateChange}
                        />
                      )}
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClearFilters}
                  >
                    <Text style={styles.clearButtonText}>Clear All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={handleApplyDateFilter}
                  >
                    <Text style={styles.applyButtonText}>Apply Filters</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default InvoiceListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    padding: 16,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 14,
    height: 50,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },

  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  filterButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 6,
  },

  filterBadge: {
    marginLeft: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  invoiceCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#eef2f7',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },

  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  invoiceCode: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginRight: 10,
  },

  invoiceDate: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '600',
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginLeft: 8,
  },

  paidBadge: {
    backgroundColor: '#dcfce7',
  },

  pendingBadge: {
    backgroundColor: '#fef3c7',
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  paidText: {
    color: '#16a34a',
  },

  pendingText: {
    color: '#d97706',
  },

  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    marginLeft: 8,
  },

  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4b5563',
    letterSpacing: 0.5,
  },

  amountPill: {
    alignItems: 'flex-end',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    minWidth: 92,
  },

  amountLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
    marginBottom: 4,
  },

  amountText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },

  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },

  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  customerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  mobileText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
    fontWeight: '600',
  },

  itemPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 12,
  },

  itemPreviewTitle: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '700',
  },

  itemPreviewValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '800',
  },

  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 12,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  bottomHint: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },

  arrowText: {
    fontSize: 24,
    color: '#cbd5e1',
    fontWeight: '300',
    lineHeight: 24,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#374151',
    marginTop: 16,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },

  clearFiltersButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },

  clearFiltersText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },

  modalBody: {
    padding: 20,
  },

  filterSection: {
    marginBottom: 24,
  },

  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },

  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 10,
    marginBottom: 10,
  },

  activeFilterOption: {
    backgroundColor: COLORS.primary,
  },

  filterOptionText: {
    color: '#374151',
    fontWeight: '600',
  },

  activeFilterOptionText: {
    color: '#fff',
  },

  dateInput: {
    marginBottom: 12,
  },

  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  datePickerText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },

  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 10,
  },

  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },

  clearButtonText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 15,
  },

  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },

  applyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#eef2f7',
  },

  skeletonCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },

  skeletonCodeRow: {
    flex: 1,
  },

  skeletonCustomerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  skeletonCircle: {
    borderRadius: 19,
    backgroundColor: '#e5e7eb',
  },

  skeletonLine: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
});