import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  ChevronLeft,
  UserPlus,
  Wrench,
  IndianRupee,
  Pencil,
  Trash2,
  X,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/Colors';
import { customerService } from '../services/Customer';
import { invoiceService } from '../services/invoiceService';

// ─── helpers ────────────────────────────────────────────────────────────────

const currency = n =>
  Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

// ─── sub-components ─────────────────────────────────────────────────────────

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

// ─── main ────────────────────────────────────────────────────────────────────

export default function CreateInvoiceSingle() {
  const navigation = useNavigation();

  const [customerModal, setCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    customerService.getAll().then(setCustomers).catch(console.error);
  });

  // step 1
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  // step 2 – add form
  const [form, setForm] = useState({ name: '', quantity: '', price: '' });
  const [formErrors, setFormErrors] = useState({});
  const [products, setProducts] = useState([]);

  // step 2 – inline edit
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    quantity: '',
    price: '',
  });

  // step 3
  const [labourCharge, setLabourCharge] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');

  // ── derived ──────────────────────────────────────────────────────────────

  const subtotal = products.reduce((s, p) => s + p.quantity * p.price, 0);
  const grandTotal = subtotal + (Number(labourCharge) || 0);

  // ── product actions ───────────────────────────────────────────────────────

  const validateForm = f => {
    const e = {};
    if (!f.name.trim()) e.name = 'Required';
    if (!f.quantity) e.quantity = 'Required';
    if (!f.price) e.price = 'Required';
    return e;
  };

  const addProduct = () => {
    const errors = validateForm(form);
    if (Object.keys(errors).length) return setFormErrors(errors);
    setProducts(prev => [
      ...prev,
      {
        id: Date.now(),
        name: form.name,
        quantity: Number(form.quantity),
        price: Number(form.price),
      },
    ]);
    setForm({ name: '', quantity: '', price: '' });
    setFormErrors({});
  };

  const startEdit = item => {
    setEditId(item.id);
    setEditForm({
      name: item.name,
      quantity: String(item.quantity),
      price: String(item.price),
    });
  };

  const saveEdit = () => {
    setProducts(prev =>
      prev.map(p =>
        p.id === editId
          ? {
              ...p,
              name: editForm.name,
              quantity: Number(editForm.quantity),
              price: Number(editForm.price),
            }
          : p,
      ),
    );
    setEditId(null);
  };

  const deleteProduct = id =>
    setProducts(prev => prev.filter(p => p.id !== id));

  // ── submit ────────────────────────────────────────────────────────────────

  const submit = async () => {
    try {
      if (!selectedCustomer) {
        alert('Please select customer');
        return;
      }

      if (products.length === 0) {
        alert('Add at least one product');
        return;
      }

      const payload = {
        customerId: selectedCustomer.id,
        grandTotal: grandTotal,
        status: 'PENDING', // or 'PAID'
        paymentMode: null, // must be null for PENDING
        items: products.map(p => ({
          name: p.name,
          quantity: p.quantity,
          price: p.price,
        })),
      };

      const res = await invoiceService.create(payload);

      console.log('SUCCESS:', res);

      alert('Invoice Created ✅');

      // optional reset
      setSelectedCustomer(null);
      setProducts([]);
      setLabourCharge('');

      navigation.navigate('previewInvoice', { invoice: res });
    } catch (err) {
      console.error('ERROR:', err);
      alert('Failed to create invoice ❌');
    }
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Dashboard')}
            hitSlop={8}
          >
            <ChevronLeft size={30} color="#111" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Invoice</Text>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('CreateCustomer')}
          >
            <UserPlus size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Customer ── */}
          <Field label="Customer Name">
            <TouchableOpacity onPress={() => setCustomerModal(true)}>
              <View style={[styles.pillInput, { height: 50 }]}>
                <Text style={{ color: selectedCustomer ? '#111' : '#9CA3AF' }}>
                  {selectedCustomer?.name || 'Select customer'}
                </Text>
              </View>
            </TouchableOpacity>
          </Field>

          {/* ── Add Product ── */}
          <Text style={[styles.label, { marginBottom: 12 }]}>Add Product</Text>

          <Field error={formErrors.name}>
            <PillInput
              icon={Wrench}
              placeholder="Product name"
              value={form.name}
              onChangeText={v => setForm(f => ({ ...f, name: v }))}
              error={formErrors.name}
            />
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Field label="Qty" error={formErrors.quantity}>
                <PillInput
                  placeholder="0"
                  keyboardType="numeric"
                  value={form.quantity}
                  onChangeText={v => setForm(f => ({ ...f, quantity: v }))}
                  error={formErrors.quantity}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Unit Price" error={formErrors.price}>
                <PillInput
                  icon={IndianRupee}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={form.price}
                  onChangeText={v => setForm(f => ({ ...f, price: v }))}
                  error={formErrors.price}
                />
              </Field>
            </View>
          </View>

          <TouchableOpacity style={styles.dashedBtn} onPress={addProduct}>
            <Text style={styles.dashedBtnText}>＋ Add Product</Text>
          </TouchableOpacity>

          {/* ── Product List ── */}
          {products.length > 0 && (
            <View style={styles.itemsCard}>
              <View style={styles.itemsCardHeader}>
                <Text style={styles.itemsCardTitle}>
                  ITEMS ({products.length})
                </Text>
                <Text style={styles.itemsCardTotal}>₹{currency(subtotal)}</Text>
              </View>

              {products.map(item => (
                <View key={item.id} style={styles.itemRow}>
                  {editId === item.id ? (
                    <>
                      <View style={{ flex: 1 }}>
                        <TextInput
                          value={editForm.name}
                          onChangeText={v =>
                            setEditForm(f => ({ ...f, name: v }))
                          }
                          style={[styles.editInput, { marginBottom: 8 }]}
                        />
                        <View style={{ flexDirection: 'row' }}>
                          <TextInput
                            value={editForm.quantity}
                            keyboardType="numeric"
                            onChangeText={v =>
                              setEditForm(f => ({ ...f, quantity: v }))
                            }
                            style={[
                              styles.editInput,
                              { flex: 1, marginRight: 10 },
                            ]}
                            placeholder="Qty"
                          />
                          <TextInput
                            value={editForm.price}
                            keyboardType="numeric"
                            onChangeText={v =>
                              setEditForm(f => ({ ...f, price: v }))
                            }
                            style={[styles.editInput, { flex: 1 }]}
                            placeholder="Price"
                          />
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={saveEdit}
                        style={styles.saveBtn}
                      >
                        <Text style={styles.saveBtnText}>Save</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemSub}>
                          {item.quantity} × ₹{item.price.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.itemActions}>
                        <Text style={styles.itemTotal}>
                          ₹{currency(item.quantity * item.price)}
                        </Text>
                        <TouchableOpacity
                          onPress={() => startEdit(item)}
                          hitSlop={6}
                          style={styles.itemActionsIcon}
                        >
                          <Pencil size={18} color="#2563eb" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => deleteProduct(item.id)}
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

          {/* ── Summary ── */}
          <View style={[styles.summaryRow, styles.grandTotalRow]}>
            <Text style={styles.grandLabel}>Grand Total</Text>
            <Text style={styles.grandValue}>₹{currency(grandTotal)}</Text>
          </View>

          {/* ── Submit ── */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={submit}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>Generate Bill</Text>
          </TouchableOpacity>
        </ScrollView>
        <Modal visible={customerModal} animationType="slide" transparent>
          <View
            style={{
              flex: 1,
              // backgroundColor: 'rgba(0,0,0,0.4)',
              justifyContent: 'flex-end',
              position: 'relative',
            }}
          >
            {/* Background click */}
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
                Select Customer
              </Text>

              <FlatList
                data={customers}
                keyExtractor={item => item.id.toString()}
                style={{ maxHeight: 250 }} // 👈 controls visible items
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
              />

              <TouchableOpacity
                onPress={() => setCustomerModal(false)}
                style={{
                  marginTop: 10,
                  padding: 5,
                  backgroundColor: 'red',
                  borderRadius: 10,
                  alignItems: 'center',
                  position: 'absolute',
                  top: 0,
                  right: 20,
                }}
              >
                <X style={{ color: '#fff', fontWeight: '700' }} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────

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

  title: { fontSize: 26, fontWeight: '800', color: '#111' },

  iconBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    padding: 10,
  },

  scroll: { padding: 20, paddingBottom: 40 },

  label: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 6 },

  // Pill input
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

  // Dashed add button
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

  // Items card
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
  itemSub: { fontSize: 13, color: COLORS.secondary, marginTop: 3 },

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

  // Summary
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 15, color: '#6b7280', fontWeight: '600' },
  summaryValue: { fontSize: 15, fontWeight: '700', color: '#111' },

  grandTotalRow: {
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  grandLabel: { fontSize: 18, fontWeight: '800', color: '#111' },
  grandValue: { fontSize: 22, fontWeight: '900', color: COLORS.primary },

  // Payment mode
  modeBtn: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeBtnText: { fontWeight: '700', fontSize: 15, color: '#6b7280' },
  modeBtnTextActive: { color: '#fff' },

  // Submit
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
  submitBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.3,
  },
});
