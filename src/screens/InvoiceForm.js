import React, { useEffect, useMemo, useState } from 'react';
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
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ChevronLeft,
  UserPlus,
  Wrench,
  IndianRupee,
  Pencil,
  Trash2,
  X,
  CalendarDays,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../constants/Colors';
import { customerService } from '../services/Customer';
import { invoiceService } from '../services/invoiceService';


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
    {Icon && <Icon size={20} color={COLORS.secondary} style={{ marginRight: 10 }} />}
    <TextInput
      placeholderTextColor="#9CA3AF"
      style={styles.pillTextInput}
      {...props}
    />
  </View>
);


export default function CreateInvoiceSingle() {
  const navigation = useNavigation();
  const route = useRoute();


  const [customerModal, setCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);


  const [form, setForm] = useState({ name: '', quantity: '', price: '' });
  const [formErrors, setFormErrors] = useState({});
  const [products, setProducts] = useState([]);


  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);


  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', quantity: '', price: '' });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);


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
    // Load existing invoice data when in edit mode
    const { editMode, invoiceData } = route.params || {};
    
    if (editMode && invoiceData) {
      setIsEditMode(true);
      setEditingInvoiceId(invoiceData.id);
      
      // Set customer
      if (invoiceData.customer) {
        setSelectedCustomer(invoiceData.customer);
      }
      
      // Set invoice date
      if (invoiceData.invoiceDate) {
        setInvoiceDate(new Date(invoiceData.invoiceDate));
      }
      
      // Set payment mode
      if (invoiceData.paymentMode) {
        setPaymentMode(invoiceData.paymentMode);
      }
      
      // Set products/items
      if (invoiceData.items && invoiceData.items.length > 0) {
        const items = invoiceData.items.map((item, index) => ({
          id: Date.now() + index,
          name: item.name,
          quantity: item.qty,
          price: item.unitPrice,
        }));
        setProducts(items);
      }
    }
  }, [route.params]);


  const subtotal = useMemo(
    () => products.reduce((s, p) => s + Number(p.quantity) * Number(p.price), 0),
    [products],
  );


  const totalAmount = subtotal;


  const validateForm = f => {
    const e = {};
    if (!f.name.trim()) e.name = 'Required';
    if (!f.quantity || Number(f.quantity) <= 0) e.quantity = 'Required';
    if (!f.price || Number(f.price) < 0) e.price = 'Required';
    return e;
  };


  const addProduct = () => {
    const errors = validateForm(form);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }


    setProducts(prev => [
      ...prev,
      {
        id: Date.now(),
        name: form.name.trim(),
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
    const errors = validateForm(editForm);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }


    setProducts(prev =>
      prev.map(p =>
        p.id === editId
          ? {
              ...p,
              name: editForm.name.trim(),
              quantity: Number(editForm.quantity),
              price: Number(editForm.price),
            }
          : p,
      ),
    );


    setEditId(null);
    setEditForm({ name: '', quantity: '', price: '' });
    setFormErrors({});
  };


  const deleteProduct = id => {
    setProducts(prev => prev.filter(p => p.id !== id));
    if (editId === id) setEditId(null);
  };


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
        invoiceType: 'PRODUCT',
        invoiceDate: formatDate(invoiceDate),
        customerId: selectedCustomer.id,
        paymentStatus: 'PENDING',
        paymentMode: paymentMode,
        items: products.map(p => ({
          name: p.name,
          qty: p.quantity,
          unitPrice: p.price,
        })),
        totalAmount,
      };


      let res;
      if (isEditMode && editingInvoiceId) {
        // Update existing invoice
        res = await invoiceService.update(editingInvoiceId, payload);
        Alert.alert('Success', 'Invoice updated successfully ✅');
      } else {
        // Create new invoice
        res = await invoiceService.create(payload);
        Alert.alert('Success', 'Invoice Created ✅');
      }


      // Reset form
      setSelectedCustomer(null);
      setProducts([]);
      setForm({ name: '', quantity: '', price: '' });
      setEditId(null);
      setEditForm({ name: '', quantity: '', price: '' });
      setPaymentStatus('PENDING');
      setPaymentMode('Cash');
      setInvoiceDate(new Date());
      setIsEditMode(false);
      setEditingInvoiceId(null);


      navigation.navigate('previewInvoice', { invoiceId: res.id || res._id });
    } catch (err) {
      console.error('ERROR:', err);
      Alert.alert('Error', isEditMode ? 'Failed to update invoice ❌' : 'Failed to create invoice ❌');
    }
  };


  const handleDelete = () => {
    if (!isEditMode || !editingInvoiceId) return;
    
    Alert.alert(
      'Delete Invoice',
      'Are you sure you want to delete this invoice?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await invoiceService.delete(editingInvoiceId);
              Alert.alert('Success', 'Invoice deleted successfully ✅');
              navigation.goBack();
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete invoice ❌');
            }
          },
        },
      ]
    );
  };


  const getTitle = () => {
    return isEditMode ? 'Edit Invoice' : 'Create Invoice';
  };


  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={8}
          >
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
        >
          <Field label="Customer Name">
            <TouchableOpacity onPress={() => setCustomerModal(true)}>
              <View style={[styles.pillInput, { height: 50 }]}>
                <Text style={{ color: selectedCustomer ? '#111' : '#9CA3AF' }}>
                  {selectedCustomer?.name || 'Select customer'}
                </Text>
              </View>
            </TouchableOpacity>
          </Field>


          <Field label="Invoice Date">
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <View style={[styles.pillInput, { height: 50, justifyContent: 'space-between' }]}>
                <Text style={{ color: '#111', fontWeight: '600' }}>
                  {formatDate(invoiceDate)}
                </Text>
                <CalendarDays size={20} color={COLORS.secondary} />
              </View>
            </TouchableOpacity>
          </Field>


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


          {products.length > 0 && (
            <View style={styles.itemsCard}>
              <View style={styles.itemsCardHeader}>
                <Text style={styles.itemsCardTitle}>ITEMS ({products.length})</Text>
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
                          placeholder="Product name"
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
                      <TouchableOpacity onPress={saveEdit} style={styles.saveBtn}>
                        <Text style={styles.saveBtnText}>Save</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemSub}>
                          {item.quantity} × ₹{Number(item.price).toFixed(2)}
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
                          <Pencil size={18} color={COLORS.primary} />
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


          <View style={[styles.summaryRow, styles.grandTotalRow]}>
            <Text style={styles.grandLabel}>Grand Total</Text>
            <Text style={styles.grandValue}>₹{currency(totalAmount)}</Text>
          </View>


          <TouchableOpacity
            style={styles.submitBtn}
            onPress={submit}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>
              {isEditMode ? 'Update Bill' : 'Generate Bill'}
            </Text>
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
              <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 10 }}>
                Select Customer
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
                    No customers found.
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
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
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
  grandTotalRow: {
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  grandLabel: { fontSize: 18, fontWeight: '800', color: '#111' },
  grandValue: { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modeBtn: {
    minWidth: 90,
    marginRight: 8,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
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
  modeBtnText: { fontWeight: '700', fontSize: 14, color: '#6b7280' },
  modeBtnTextActive: { color: '#fff' },
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