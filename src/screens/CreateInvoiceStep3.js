import React, { useState } from 'react';
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
import {
  IndianRupee,
  ChevronLeft,
  Receipt,
  Wrench,
  Trash2,
  Pencil,
  Hash,
} from 'lucide-react-native';
import { COLORS } from '../constants/Colors';
import { Dropdown } from 'react-native-element-dropdown';
import StepIndicator from '../components/StepIndicator';
import { numberToIndianWords } from '../utils/numberToIndianWords';

export default function CreateInvoiceStep3({ route, navigation }) {
  const invoiceData = route?.params?.invoice;
  const [labourCharge, setLabourCharge] = useState(null);
  const [subtotal, setSubtotal] = useState(invoiceData?.subtotal || 0);
  const [discountType, setDiscountType] = useState('percentage'); // percentage | amount
  const [discountValue, setDiscountValue] = useState(null);
  const [discountError, setDiscountError] = useState(null);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const discountOptions = [
    { label: 'percentage (%)', value: 'percentage' },
    { label: 'Amount (₹)', value: 'amount' },
  ];
  const paymentOptions = [
    { label: 'Cash', value: 'Cash' },
    { label: 'GPay', value: 'GPay' },
  ];

  // console.log('Received Invoice Data in Step 3:', invoiceData);

  const labour = parseFloat(labourCharge) || 0;
  const discount = parseFloat(discountValue) || 0;

  const baseAmount = subtotal + labour;

  let discountAmount = 0;

  if (discountType === 'percentage') {
    discountAmount = (baseAmount * discount) / 100;
  } else {
    discountAmount = discount;
  }

  const grandTotal = (baseAmount - discountAmount).toFixed(2);

  const rupees = Math.floor(grandTotal);
  const paise = Math.round((grandTotal % 1) * 100);

  const amountInWords = `${numberToIndianWords(rupees)} ${
    paise ? `and ${numberToIndianWords(paise)} paise` : ''
  } only`;

  const handleDiscountChange = text => {
    // allow numbers and one decimal point
    const value = text.replace(/[^0-9.]/g, '');

    // prevent multiple dots like 3..5
    if ((value.match(/\./g) || []).length > 1) return;

    if (!value) {
      setDiscountValue('');
      setDiscountError('');
      return;
    }

    const num = Number(value);

    if (discountType === 'percentage') {
      if (num > 100) {
        setDiscountError('Percentage must be between 0 and 100');
        return;
      }
    } else {
      if (num > baseAmount) {
        setDiscountError(`Amount cannot exceed ₹${baseAmount}`);
        return;
      }
    }

    setDiscountError('');
    setDiscountValue(value);
  };

  const next = () => {
    const finalInvoice = {
      ...invoiceData,
      labourCharge: labour,
      discount: discountValue,
      paymentMode,
      subtotal,
      grandTotal,
    };

    // console.log('Final Invoice:', finalInvoice);
    navigation.navigate('previewInvoice', {
      invoice: finalInvoice,
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
          </View>
          <StepIndicator step={3} />

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={{ marginVertical: 20 }}>
              <Text style={styles.heading}>Billing Summary</Text>
            </View>

            <View style={styles.summaryCard}>
              {/* Subtotal */}
              <View style={styles.row}>
                <Text style={[styles.label, { color: COLORS.secondary }]}>
                  Subtotal
                </Text>
                <Text style={styles.amount}>
                  ₹{subtotal.toFixed(2).toLocaleString()}
                </Text>
              </View>

              {/* Labour Charge */}
              <Text style={styles.label}>Labour Charge</Text>

              <View style={[styles.inputContainer]}>
                <TextInput
                  placeholder="Enter a Labour Charge"
                  keyboardType="numeric"
                  style={styles.textInput}
                  value={labourCharge}
                  placeholderTextColor="#9CA3AF"
                  onChangeText={text => {
                    const value = text.replace(/[^0-9.]/g, '');

                    // prevent multiple decimal points
                    if ((value.match(/\./g) || []).length > 1) return;

                    setLabourCharge(value);
                  }}
                />
              </View>

              {/* Discount
              <View style={styles.discountRow}>
                Discount Type
                <View style={styles.field}>
                  <Text style={styles.label}>Discount Type</Text>
                  <View>
                    <Dropdown
                      style={styles.dropdown}
                      data={discountOptions}
                      labelField="label"
                      valueField="value"
                      placeholder="Select type"
                      value={discountType}
                      onChange={item => {
                        setDiscountType(item.value);
                        setDiscountValue('');
                        setDiscountError('');
                      }}
                    />
                  </View>
                </View>

                Discount Value
                <View style={styles.field}>
                  <Text style={styles.label}>Value</Text>

                  <View style={styles.pillInput}>
                    <TextInput
                      value={discountValue}
                      keyboardType="numeric"
                      placeholder="Enter value"
                      placeholderTextColor="#9CA3AF"
                      onChangeText={handleDiscountChange}
                      style={{
                        flex: 1,
                        width: '90%',
                        fontSize: 18,
                        fontWeight: '600',
                        color: 'black',
                      }}
                    />
                  </View>
                  {discountError ? (
                    <Text style={styles.errorText}>{discountError}</Text>
                  ) : null}
                </View>
              </View> */}

              {/* Grand Total */}
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>GRAND TOTAL</Text>
                <Text style={styles.totalAmount}>
                  ₹{grandTotal.toLocaleString()}
                </Text>
              </View>
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                marginTop: 10,
                color: COLORS.secondary,
              }}
            >
              Amount in words
            </Text>
            <Text
              style={[
                styles.subtitle,
                { marginTop: 5, marginBottom: 15, fontWeight: '600' },
              ]}
            >
              {amountInWords}
            </Text>

            {/* Payment Mode */}
            <Text style={styles.label}>Payment Mode</Text>

            <Dropdown
              style={styles.dropdown}
              data={paymentOptions}
              labelField="label"
              valueField="value"
              placeholder="Select payment mode"
              value={paymentMode}
              onChange={item => setPaymentMode(item.value)}
            />

            {/* Next Button */}
            <TouchableOpacity style={styles.button} onPress={next}>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Generate Bill</Text>
                <Receipt size={20} color="#fff" />
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
  textInput: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 16,
    color: 'black',
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

  summaryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    elevation: 3,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  amount: {
    fontSize: 18,
    fontWeight: '700',
  },

  errorText: {
    color: '#ef4444',
    marginBottom: 10,
    marginLeft: 6,
    fontSize: 13,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 6,
    marginTop: 10,
  },

  field: {
    width: '48%',
  },

  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
  dropdown: {
    flex: 1,
    height: 55,
    width: '100%',
    borderRadius: 30,
    paddingHorizontal: 20,
    border: 'none',
    backgroundColor: COLORS.accent,
  },

  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    padding: 20,
    borderRadius: 20,
    marginTop: 20,
  },

  totalLabel: {
    fontWeight: '700',
    color: COLORS.primary,
  },

  totalAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
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
});
