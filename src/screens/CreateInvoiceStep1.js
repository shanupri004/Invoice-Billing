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
} from 'react-native';
import StepIndicator from '../components/StepIndicator';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Calendar,
  ChevronLeft,
  User,
  Phone,
  X,
  ChevronRight,
} from 'lucide-react-native';
import { COLORS } from '../constants/Colors';
import ConfirmModal from '../components/ConfirmModal';
import { generateInvoiceNumber } from '../utils/generateInvoiceNumber';

export default function Step1({ navigation }) {
  const [name, setName] = useState(null);
  const [phone, setPhone] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState(null);
  const [errors, setErrors] = useState({});
  const [closeMode, setCloseModal] = useState(false);

  useEffect(() => {
    loadInvoiceNumber();
  }, []);

  const loadInvoiceNumber = async () => {
    const number = await generateInvoiceNumber();
    setInvoiceNumber(number);
  };

  const onChangeDate = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const formatDate = date => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const validate = () => {
    let newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Customer name is required';
    }

    if (phone && phone.length !== 10) {
      newErrors.phone = 'Mobile number must be 10 digits';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (!validate()) return;

    const invoiceData = {
      invoiceNumber,
      date: formatDate(date),
      customerName: name,
      phone,
    };

    console.log('Invoice Data:', invoiceData);
    navigation.navigate('CreateInvoiceStep2', {
      invoice: invoiceData,
    });
  };

  const handleClose = () => {
    setCloseModal(false);
    navigation.replace('Dashboard');
  };
  return (
    <SafeAreaView style={styles.safeArea}>
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
        <StepIndicator step={1} />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={{ marginVertical: 20 }}>
            <Text style={styles.heading}>Customer Details</Text>
            <Text style={styles.description}>
              Please provide the customer and billing information below
            </Text>
          </View>

          {/* Customer Name */}
          <Text style={styles.label}>Customer name</Text>

          <View
            style={[styles.inputContainer, errors.name && styles.errorBorder]}
          >
            <User size={24} style={styles.icon} />

            <TextInput
              placeholder="Enter name"
              placeholderTextColor="#aaa"
              style={styles.textInput}
              value={name}
              onChangeText={text => {
                setName(text);
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: null }));
                }
              }}
            />
          </View>

          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          {/* Invoice + Date */}
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>Invoice Number</Text>

              <View style={styles.pillInput}>
                <Text style={styles.invoiceText}>{invoiceNumber}</Text>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Date</Text>

              <TouchableOpacity
                style={styles.pillInput}
                onPress={() => setShowPicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(date)}</Text>

                <Calendar size={22} color="#374151" />
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}
            </View>
          </View>

          {/* Phone */}
          <Text style={styles.label}>Mobile number (Optional)</Text>

          <View
            style={[styles.inputContainer, errors.phone && styles.errorBorder]}
          >
            <Phone size={24} style={styles.icon} />

            <TextInput
              placeholder="Enter Mobile number"
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
              maxLength={10}
              style={styles.textInput}
              value={phone}
              onChangeText={text => {
                setPhone(text);
                if (errors.phone) {
                  setErrors(prev => ({ ...prev, phone: null }));
                }
              }}
            />
          </View>

          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

          {/* Next Button */}
          <TouchableOpacity style={styles.button} onPress={next}>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>Next</Text>
              <ChevronRight size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <ConfirmModal
        visible={closeMode}
        title="Exit Invoice?"
        message="Your current invoice details will be lost. Do you want to exit?"
        confirmText="Exit"
        cancelText="Cancel"
        danger={true}
        onCancel={() => setCloseModal(false)}
        onConfirm={handleClose}
      />
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
  },

  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
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
    paddingVertical: 16,
    marginBottom: 10,
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
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
  },

  invoiceText: {
    fontWeight: '700',
    fontSize: 18,
    color: '#1e3a8a',
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
});
