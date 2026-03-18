import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import StepIndicator from '../components/StepIndicator';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Trash2,
  Pencil,
  Hash,
} from 'lucide-react-native';
import { COLORS } from '../constants/Colors';

export default function Step2({ navigation, route }) {
  const [productName, setProductName] = useState(null);
  const [quantity, setQuantity] = useState(null);
  const [price, setPrice] = useState(null);
  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [closeMode, setCloseModal] = useState(false);
  const invoiceData = route?.params?.invoice;
  const [editingId, setEditingId] = useState(null);
  const [editProductName, setEditProductName] = useState(null);
  const [editQuantity, setEditQuantity] = useState(null);
  const [editPrice, setEditPrice] = useState(null);

  const startEdit = item => {
    setEditingId(item.id);
    setEditProductName(item.name);
    setEditQuantity(item.quantity.toString());
    setEditPrice(item.price.toString());
  };

  const updateProduct = () => {
    const updatedProducts = products.map(p =>
      p.id === editingId
        ? {
            ...p,
            name: editProductName,
            quantity: Number(editQuantity),
            price: Number(editPrice),
          }
        : p,
    );

    setProducts(updatedProducts);
    setEditingId(null);
  };

  const validateProduct = () => {
    let newErrors = {};

    if (!productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    if (!quantity || Number(quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!price || Number(price) <= 0) {
      newErrors.price = 'Unit price must be greater than 0';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const addProduct = () => {
    if (!validateProduct()) return;

    const newProduct = {
      id: Date.now(),
      name: productName,
      quantity: Number(quantity),
      price: Number(price),
    };

    setProducts([...products, newProduct]);

    setProductName('');
    setQuantity('');
    setPrice('');
    setErrors({});
  };

  const deleteProduct = id => {
    setProducts(products.filter(p => p.id !== id));
  };

  const total = products.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );
  const next = () => {
    // if (!validate()) return;

    const updatedInvoice = {
      ...invoiceData,
      products,
      subtotal: total,
    };

    console.log('Invoice Data with product:', updatedInvoice);
    navigation.navigate('CreateInvoiceStep3', {
      invoice: updatedInvoice,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={40}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#f4f6fb" />

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeft size={30} color="#111" />
            </TouchableOpacity>

            <View style={{ marginLeft: 10 }}>
              <Text style={styles.title}>Create Invoice</Text>
              <Text style={styles.subtitle}>Aadhi Engine Service</Text>
            </View>
            <TouchableOpacity onPress={() => setCloseModal(true)}>
              <X size={30} color="#111" />
            </TouchableOpacity>
          </View>
          <StepIndicator step={2} />

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={{ marginVertical: 20 }}>
              <Text style={styles.heading}>Add Products</Text>
            </View>

            {/* Customer Name */}
            <Text style={styles.label}>Product Name</Text>

            <View
              style={[
                styles.inputContainer,
                errors.productName && styles.errorBorder,
              ]}
            >
              <Wrench size={24} style={styles.icon} />

              <TextInput
                placeholder="Enter Product Name"
                style={styles.textInput}
                value={productName}
                placeholderTextColor="#9CA3AF"
                onChangeText={text => {
                  setProductName(text);
                  if (errors.productName) {
                    setErrors(prev => ({ ...prev, productName: null }));
                  }
                }}
              />
            </View>

            {errors.productName && (
              <Text style={styles.errorText}>{errors.productName}</Text>
            )}

            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            {/* Invoice + Date */}
            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>Quantity</Text>

                <View
                  style={[
                    styles.pillInput,
                    errors.quantity && styles.errorBorder,
                  ]}
                >
                  <TextInput
                    style={{
                      flex: 1,
                      width: '90%',
                      fontSize: 18,
                      fontWeight: '600',
                      color: 'black',
                    }}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    value={quantity}
                    keyboardType="numeric"
                    onChangeText={text => {
                      setQuantity(text.replace(/[^0-9]/g, ''));
                      if (errors.quantity) {
                        setErrors(prev => ({ ...prev, quantity: null }));
                      }
                    }}
                  />
                </View>

                {errors.quantity && (
                  <Text style={styles.errorText}>{errors.quantity}</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Unit Price</Text>

                <View
                  style={[styles.pillInput, errors.price && styles.errorBorder]}
                >
                  <IndianRupee size={22} />

                  <TextInput
                    placeholder="0.00"
                    value={price}
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                    onChangeText={text => {
                      const value = text.replace(/[^0-9.]/g, '');

                      // prevent multiple decimal points
                      if ((value.match(/\./g) || []).length > 1) return;

                      setPrice(value);

                      if (errors.price) {
                        setErrors(prev => ({ ...prev, price: null }));
                      }
                    }}
                    style={{
                      width: '90%',
                      fontSize: 18,
                      fontWeight: '600',
                      color: 'black',
                    }}
                  />
                </View>

                {errors.price && (
                  <Text style={styles.errorText}>{errors.price}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={addProduct}>
              <Text style={styles.addButtonText}>＋ Add Product</Text>
            </TouchableOpacity>

            <View style={styles.itemsContainer}>
              {/* Header */}
              <View style={styles.itemsHeader}>
                <Text style={styles.itemsTitle}>ITEMS ({products.length})</Text>
                <Text style={styles.totalHeader}>
                  Total: ₹{total.toFixed(2).toLocaleString()}
                </Text>
              </View>
              {products.map(item => (
                <View key={item.id} style={styles.itemRow}>
                  {editingId === item.id ? (
                    <>
                      <View style={{ flex: 1 }}>
                        <TextInput
                          value={editProductName}
                          onChangeText={setEditProductName}
                          style={styles.editInput}
                        />

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          <TextInput
                            value={editQuantity}
                            keyboardType="numeric"
                            onChangeText={setEditQuantity}
                            style={styles.editInputSmall}
                          />

                          <TextInput
                            value={editPrice}
                            keyboardType="numeric"
                            onChangeText={setEditPrice}
                            style={styles.editInputSmall}
                          />
                        </View>
                      </View>

                      <TouchableOpacity onPress={updateProduct}>
                        <Text style={{ color: 'green', fontWeight: '700' }}>
                          Save
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>{item.name}</Text>

                        <Text style={styles.itemSub}>
                          Qty: {item.quantity} × ₹
                          {item.price.toFixed(2).toLocaleString()}
                        </Text>
                      </View>

                      <View style={styles.rightSide}>
                        <Text style={styles.itemPrice}>
                          ₹
                          {(item.quantity * item.price)
                            .toFixed(2)
                            .toLocaleString()}
                        </Text>

                        <TouchableOpacity onPress={() => startEdit(item)}>
                          <Pencil size={20} color="#2563eb" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => deleteProduct(item.id)}
                        >
                          <Trash2 size={22} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              ))}
            </View>

            {/* Next Button */}
            <TouchableOpacity style={styles.button} onPress={next}>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Next</Text>
                <ChevronRight size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    height: '100%',
    // backgroundColor: 'yellow',
    paddingBottom: 10,
  },

  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  title: {
    fontSize: 34,
    fontWeight: 'bold',
  },

  subtitle: {
    color: COLORS.secondary,
    fontSize: 16,
  },

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  description: {
    color: '#6b7280',
    marginTop: 6,
    fontSize: 15,
  },

  label: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 18,
    elevation: 3,
    marginBottom: 10,
  },

  icon: {
    marginRight: 10,
    color: COLORS.secondary,
  },

  textInput: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 16,
  },

  errorBorder: {
    borderWidth: 2,
    borderColor: '#ef4444',
  },

  errorText: {
    color: '#ef4444',
    marginBottom: 10,
    marginLeft: 6,
    fontSize: 13,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  field: {
    width: '48%',
  },

  pillInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    // paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
  },

  invoiceText: {
    fontWeight: '700',
    fontSize: 18,
    color: COLORS.primary,
  },

  dateText: {
    fontSize: 18,
    fontWeight: '600',
  },

  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // spacing between text and icon
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  addButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    backgroundColor: COLORS.accent,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 15,
  },

  addButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 16,
  },

  itemsContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 20,
    overflow: 'hidden',
    elevation: 3,
  },

  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },

  itemsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b7280',
  },

  totalHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },

  itemName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },

  itemSub: {
    fontSize: 15,
    marginTop: 4,
    color: COLORS.secondary,
  },

  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  itemPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },

  delete: {
    fontSize: 18,
    color: 'red',
  },

  editInput: {
    borderBottomWidth: 1,
    borderColor: '#d1d5db',
    fontSize: 16,
    marginBottom: 6,
  },

  editInputSmall: {
    borderBottomWidth: 1,
    borderColor: '#d1d5db',
    width: 60,
  },
});
