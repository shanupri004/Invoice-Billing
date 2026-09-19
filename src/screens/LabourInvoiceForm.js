import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ChevronLeft,
  UserPlus,
  FileText,
  IndianRupee,
  Pencil,
  Trash2,
  X,
  Hash,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../constants/Colors';
import { customerService } from '../services/Customer';
import { invoiceService } from '../services/invoiceService';
import { useTranslation } from '../localization/LanguageContext';
import Text from '../components/AppText';

const currency = n =>
  Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

const formatDate = d => {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const Field = ({ label, error, children }) => (
  <View style={{ marginBottom: 14 }}>
    {label && <Text style={styles.label}>{label}</Text>}
    {children}
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const PillInput = ({ icon: Icon, error, containerStyle, ...props }) => (
  <View style={[styles.pillInput, error && styles.errorBorder, containerStyle]}>
    {Icon && (
      <Icon size={20} color={COLORS.secondary} style={{ marginRight: 10 }} />
    )}
    <TextInput
      placeholderTextColor="#9CA3AF"
      style={styles.pillTextInput}
      {...props}
    />
  </View>
);

export default function CreateLabourInvoice() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  const [customerModal, setCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [form, setForm] = useState({ description: '', amount: '' });
  const [formErrors, setFormErrors] = useState({});
  const [items, setItems] = useState([]);
  const [BillNo, setBillNo] = useState('');

  const [paymentMode, setPaymentMode] = useState('Cash');
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [isPaid, setIsPaid] = useState(false);

  const paymentModes = ['Cash', 'UPI', 'Card', 'Net Banking'];
  const paymentModeLabels = {
    Cash: t('common.cash'),
    UPI: t('common.upi'),
    Card: t('common.card'),
    'Net Banking': t('common.netBanking'),
  };

  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ description: '', amount: '' });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const data = await customerService.getAll();
        setCustomers(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadCustomers();
  }, []);

  useEffect(() => {
    const { editMode, invoiceData } = route.params || {};

    if (editMode && invoiceData) {
      setIsEditMode(true);
      setEditingInvoiceId(invoiceData.id);

      setIsPaid(invoiceData.paymentStatus === 'PAID');
      setPaymentMode(invoiceData.paymentMode || 'Cash');
      setBillNo(String(invoiceData.bill_no ?? invoiceData.billNo ?? ''));

      if (invoiceData.customer) setSelectedCustomer(invoiceData.customer);
      if (invoiceData.invoiceDate) setInvoiceDate(new Date(invoiceData.invoiceDate));

      if (invoiceData.items && invoiceData.items.length > 0) {
        const mapped = invoiceData.items.map((item, index) => ({
          id: Date.now() + index,
          description: item.description ?? item.name ?? '',
          amount: Number(item.amount ?? item.unitPrice ?? 0),
        }));
        setItems(mapped);
      }
    }
  }, [route.params]);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + Number(i.amount), 0),
    [items],
  );

  const totalAmount = subtotal;

  const validateForm = f => {
    const e = {};
    if (!f.description.trim()) e.description = t('common.required');
    if (!f.amount || Number(f.amount) < 0) e.amount = t('common.required');
    return e;
  };

  const addItem = () => {
    const errors = validateForm(form);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setItems(prev => [
      ...prev,
      {
        id: Date.now(),
        description: form.description.trim(),
        amount: Number(form.amount),
      },
    ]);

    setForm({ description: '', amount: '' });
    setFormErrors({});
  };

  const startEdit = item => {
    setEditId(item.id);
    setEditForm({
      description: item.description,
      amount: String(item.amount),
    });
  };

  const saveEdit = () => {
    const errors = validateForm(editForm);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setItems(prev =>
      prev.map(i =>
        i.id === editId
          ? {
              ...i,
              description: editForm.description.trim(),
              amount: Number(editForm.amount),
            }
          : i,
      ),
    );

    setEditId(null);
    setEditForm({ description: '', amount: '' });
    setFormErrors({});
  };

  const deleteItem = id => {
    setItems(prev => prev.filter(i => i.id !== id));
    if (editId === id) setEditId(null);
  };

  const submit = async () => {
    if (submitting) return;
    try {
      if (!selectedCustomer) {
        alert(t('invoiceForm.pleaseSelectCustomer'));
        return;
      }

      if (items.length === 0) {
        alert(t('invoiceForm.addAtLeastOneItem'));
        return;
      }

      setSubmitting(true);

      const payload = {
        invoiceType: 'LABOUR',
        invoiceDate: formatDate(invoiceDate),
        customerId: selectedCustomer.id,

        paymentStatus: isPaid ? 'PAID' : 'PENDING',
        paymentMode: isPaid ? paymentMode : null,

        bill_no: Number(BillNo),

        items: items.map(i => ({
          description: i.description,
          amount: i.amount,
        })),

        totalAmount,
      };

      let res;
      if (isEditMode && editingInvoiceId) {
        res = await invoiceService.update(editingInvoiceId, payload);
        Alert.alert(t('common.success'), t('invoiceForm.labourInvoiceUpdated'));
      } else {
        res = await invoiceService.create(payload);
        Alert.alert(t('common.success'), t('invoiceForm.labourInvoiceCreated'));
      }

      // Reset form
      setSelectedCustomer(null);
      setItems([]);
      setForm({ description: '', amount: '' });
      setEditId(null);
      setEditForm({ description: '', amount: '' });
      setPaymentMode('Cash');
      setInvoiceDate(new Date());
      setIsEditMode(false);
      setEditingInvoiceId(null);

      navigation.navigate('previewInvoice', { invoiceId: res.id || res._id });
    } catch (err) {
      console.error('ERROR:', err.details);
      Alert.alert(err.details);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!isEditMode || !editingInvoiceId) return;

    Alert.alert(
      t('common.deleteInvoiceTitle'),
      t('common.deleteInvoiceMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await invoiceService.remove(editingInvoiceId);
              Alert.alert(t('common.success'), t('common.invoiceDeleted'));
              navigation.goBack();
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert(t('common.error'), t('common.failedDeleteInvoice'));
            }
          },
        },
      ],
    );
  };

  const getTitle = () => {
    return isEditMode ? t('invoiceForm.editLabourInvoice') : t('invoiceForm.createLabourInvoice');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
              <ChevronLeft size={30} color="#111" />
            </TouchableOpacity>
            <Text style={styles.title}>{getTitle()}</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('CreateCustomer')}
              >
                <UserPlus size={20} color="#fff" />
              </TouchableOpacity>
              {isEditMode && (
                <TouchableOpacity
                  style={[styles.iconBtn, styles.deleteBtn]}
                  onPress={handleDelete}
                >
                  <Trash2 size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Field label={t('invoiceForm.customerName')}>
              <TouchableOpacity onPress={() => setCustomerModal(true)}>
                <View style={[styles.pillInput, { height: 50 }]}>
                  <Text
                    style={{ color: selectedCustomer ? '#111' : '#9CA3AF' }}
                  >
                    {selectedCustomer?.name || t('common.selectCustomer')}
                  </Text>
                </View>
              </TouchableOpacity>
            </Field>

            <Field label={t('invoiceForm.paymentReceived')}>
              <TouchableOpacity
                style={[styles.toggleBtn, isPaid && styles.toggleBtnActive]}
                onPress={() => {
                  const value = !isPaid;
                  setIsPaid(value);

                  if (!value) {
                    setPaymentMode('');
                    setShowPaymentDropdown(false);
                  }
                }}
              >
                <Text
                  style={[styles.toggleText, isPaid && styles.toggleTextActive]}
                >
                  {isPaid ? t('common.paid') : t('common.pending')}
                </Text>
              </TouchableOpacity>
            </Field>

            {isPaid && (
              <Field label={t('invoiceForm.paymentMode')}>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowPaymentDropdown(!showPaymentDropdown)}
                >
                  <Text>
                    {paymentMode
                      ? paymentModeLabels[paymentMode]
                      : t('invoiceForm.selectPaymentMode')}
                  </Text>
                </TouchableOpacity>

                {showPaymentDropdown && (
                  <View style={styles.dropdownList}>
                    {paymentModes.map(mode => (
                      <TouchableOpacity
                        key={mode}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setPaymentMode(mode);
                          setShowPaymentDropdown(false);
                        }}
                      >
                        <Text>{paymentModeLabels[mode]}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Field>
            )}

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Field label={t('invoiceForm.invoiceDate')}>
                  <PillInput
                    placeholder="0"
                    value={formatDate(invoiceDate)}
                    onPress={() => setShowDatePicker(true)}
                  />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label={t('invoiceForm.billNo')}>
                  <PillInput
                    icon={Hash}
                    placeholder="0"
                    keyboardType="numeric"
                    value={BillNo}
                    onChangeText={v => setBillNo(v)}
                  />
                </Field>
              </View>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={invoiceDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') setShowDatePicker(false);
                  if (selectedDate) setInvoiceDate(selectedDate);
                }}
              />
            )}

            <Text style={[styles.label, { marginBottom: 12 }]}>{t('invoiceForm.addItem')}</Text>

            <Field error={formErrors.description}>
              <PillInput
                icon={FileText}
                placeholder={t('invoiceForm.descriptionPlaceholder')}
                value={form.description}
                onChangeText={v => setForm(f => ({ ...f, description: v }))}
                error={formErrors.description}
              />
            </Field>

            <Field error={formErrors.amount}>
              <PillInput
                icon={IndianRupee}
                placeholder={t('invoiceForm.amountPlaceholder')}
                keyboardType="numeric"
                value={form.amount}
                onChangeText={v => setForm(f => ({ ...f, amount: v }))}
                error={formErrors.amount}
              />
            </Field>

            <TouchableOpacity style={styles.dashedBtn} onPress={addItem}>
              <Text style={styles.dashedBtnText}>{t('invoiceForm.addItemBtn')}</Text>
            </TouchableOpacity>

            {items.length > 0 && (
              <View style={styles.itemsCard}>
                <View style={styles.itemsCardHeader}>
                  <Text style={styles.itemsCardTitle}>
                    {t('invoiceForm.items', { count: items.length })}
                  </Text>
                  <Text style={styles.itemsCardTotal}>
                    ₹{currency(subtotal)}
                  </Text>
                </View>

                {items.map(item => (
                  <View key={item.id} style={styles.itemRow}>
                    {editId === item.id ? (
                      <>
                        <View style={{ flex: 1 }}>
                          <TextInput
                            value={editForm.description}
                            onChangeText={v =>
                              setEditForm(f => ({ ...f, description: v }))
                            }
                            style={[styles.editInput, { marginBottom: 8 }]}
                            placeholder={t('invoiceForm.descriptionPlaceholder')}
                          />
                          <TextInput
                            value={editForm.amount}
                            keyboardType="numeric"
                            onChangeText={v =>
                              setEditForm(f => ({ ...f, amount: v }))
                            }
                            style={styles.editInput}
                            placeholder={t('invoiceForm.amountPlaceholder')}
                          />
                        </View>
                        <TouchableOpacity
                          onPress={saveEdit}
                          style={styles.saveBtn}
                        >
                          <Text style={styles.saveBtnText}>{t('invoiceForm.save')}</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemName}>
                            {item.description}
                          </Text>
                        </View>
                        <View style={styles.itemActions}>
                          <Text style={styles.itemTotal}>
                            ₹{currency(item.amount)}
                          </Text>
                          <TouchableOpacity
                            onPress={() => startEdit(item)}
                            hitSlop={6}
                            style={styles.itemActionsIcon}
                          >
                            <Pencil size={18} color={COLORS.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => deleteItem(item.id)}
                            hitSlop={6}
                            style={styles.itemActionsIcon}
                          >
                            <Trash2 size={18} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                ))}
              </View>
            )}

            <View style={[styles.summaryRow, styles.grandTotalRow]}>
              <Text style={styles.grandLabel}>{t('invoiceForm.grandTotal')}</Text>
              <Text style={styles.grandValue}>₹{currency(totalAmount)}</Text>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={submit}
              activeOpacity={0.85}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isEditMode ? t('invoiceForm.updateBill') : t('invoiceForm.generateBill')}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>

          <Modal visible={customerModal} animationType="slide" transparent>
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                position: 'relative',
              }}
            >
              <TouchableWithoutFeedback onPress={() => setCustomerModal(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} />
              </TouchableWithoutFeedback>

              <View
                style={{
                  backgroundColor: '#fff',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  padding: 20,
                  maxHeight: '60%',
                }}
              >
                <Text
                  style={{ fontSize: 18, fontWeight: '700', marginBottom: 10 }}
                >
                  {t('common.selectCustomerTitle')}
                </Text>

                <FlatList
                  data={customers}
                  keyExtractor={item => item.id.toString()}
                  style={{ maxHeight: 250 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{
                        padding: 14,
                        borderBottomWidth: 1,
                        borderColor: '#eee',
                      }}
                      onPress={() => {
                        setSelectedCustomer(item);
                        setCustomerModal(false);
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text style={{ color: '#6b7280', paddingVertical: 20 }}>
                      {t('common.noCustomersFound')}
                    </Text>
                  }
                />

                <TouchableOpacity
                  onPress={() => setCustomerModal(false)}
                  style={{
                    marginTop: 10,
                    padding: 8,
                    backgroundColor: 'red',
                    borderRadius: 10,
                    alignItems: 'center',
                    position: 'absolute',
                    top: 0,
                    right: 20,
                  }}
                >
                  <X color="#fff" size={18} />
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f4f6fb' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#f4f6fb',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { fontSize: 26, fontWeight: '800', color: '#111' },
  iconBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    padding: 10,
    marginLeft: 8,
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
  },
  scroll: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 6 },
  pillInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  pillTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  errorBorder: { borderColor: '#ef4444', borderWidth: 2 },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4, marginLeft: 6 },
  row: { flexDirection: 'row', marginBottom: 4 },
  dashedBtn: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    backgroundColor: COLORS.accent,
    padding: 16,
    borderRadius: 26,
    alignItems: 'center',
    marginVertical: 10,
  },
  dashedBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
  itemsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 20,
  },
  itemsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemsCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 1,
  },
  itemsCardTotal: { fontSize: 17, fontWeight: '800', color: COLORS.primary },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  itemName: { fontSize: 17, fontWeight: '700', color: '#111' },
  itemActions: { flexDirection: 'row', alignItems: 'center' },
  itemActionsIcon: { marginLeft: 14 },
  itemTotal: { fontSize: 17, fontWeight: '800', color: '#111' },
  editInput: {
    borderBottomWidth: 1.5,
    borderColor: COLORS.primary,
    fontSize: 15,
    paddingVertical: 4,
    color: '#111',
  },
  saveBtn: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: { color: '#16a34a', fontWeight: '700', fontSize: 14 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalRow: {
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  grandLabel: { fontSize: 18, fontWeight: '800', color: '#111' },
  grandValue: { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  submitBtn: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.3,
  },
  toggleBtn: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  toggleBtnActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  toggleText: {
    fontWeight: '700',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#fff',
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  dropdownList: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
});
