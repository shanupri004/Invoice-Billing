import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import {
  ChevronLeft,
  User,
  Phone,
  MapPin,
  ChevronRight,
  X,
  Trash2,
} from 'lucide-react-native';
import { COLORS } from '../constants/Colors';
import ConfirmModal from '../components/ConfirmModal';
import { customerService } from '../services/Customer';

export default function CustomerForm({ navigation, route }) {
  // ── Detect mode ────────────────────────────────────────────────────────────
  const existingCustomer = route?.params?.customer ?? null;
  const isEditMode = !!existingCustomer;

  const [loading, setLoading] = useState(false);

  // ── State — prefill if editing ─────────────────────────────────────────────
  const [name, setName] = useState(existingCustomer?.name ?? '');
  const [mobile, setMobile] = useState(existingCustomer?.mobile ?? '');
  const [address, setAddress] = useState(existingCustomer?.address ?? '');
  const [errors, setErrors] = useState({});

  const [discardModal, setDiscardModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Customer name is required';

    if (mobile && mobile.length !== 10)
      newErrors.mobile = 'Mobile number must be 10 digits';

    if (!address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = field => {
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  // ── Submit (Add or Update) ─────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true); // ✅ START loading

      const payload = {
        name,
        mobile,
        address,
      };

      if (isEditMode) {
        await customerService.update(existingCustomer.id, payload);
      } else {
        await customerService.create(payload);
      }

      navigation.navigate('customer'); // ✅ navigate after success
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false); // ✅ STOP loading
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await customerService.remove(existingCustomer.id);
      // refresh after delete
      setDeleteModal(false);
      navigation.navigate('customer');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  // ── Discard / close ────────────────────────────────────────────────────────
  const handleDiscard = () => {
    setDiscardModal(false);
    navigation.goBack();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.navigate('customer')}
              hitSlop={8}
            >
              <ChevronLeft size={30} color="#111" />
            </TouchableOpacity>

            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.title}>
                {isEditMode ? 'Edit Customer' : 'Add Customer'}
              </Text>
              <Text style={styles.subtitle}>Aadhi Engine Service</Text>
            </View>

            {/* Delete icon — only in edit mode */}
            {isEditMode && (
              <TouchableOpacity
                onPress={() => setDeleteModal(true)}
                hitSlop={8}
                style={styles.deleteIconBtn}
              >
                <Trash2 size={22} color="#ef4444" />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => setDiscardModal(true)} hitSlop={8}>
              <X size={26} color="#111" />
            </TouchableOpacity>
          </View>

          {/* ── Form ── */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headingBlock}>
              <Text style={styles.heading}>Customer Details</Text>
              <Text style={styles.description}>
                {isEditMode
                  ? 'Update the customer information below'
                  : 'Fill in the details below to add a new customer'}
              </Text>
            </View>

            {/* Name */}
            <Text style={styles.label}>Customer Name</Text>
            <View
              style={[styles.inputContainer, errors.name && styles.errorBorder]}
            >
              <User size={22} color={COLORS.secondary} style={styles.icon} />
              <TextInput
                placeholder="Enter full name"
                placeholderTextColor="#aaa"
                style={styles.textInput}
                value={name}
                onChangeText={text => {
                  setName(text);
                  clearError('name');
                }}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            {/* Phone */}
            <Text style={styles.label}>
              Mobile Number <Text style={styles.optional}>(Optional)</Text>
            </Text>
            <View
              style={[
                styles.inputContainer,
                errors.mobile && styles.errorBorder,
              ]}
            >
              <Phone size={22} color={COLORS.secondary} style={styles.icon} />
              <TextInput
                placeholder="Enter 10-digit number"
                placeholderTextColor="#aaa"
                keyboardType="phone-pad"
                maxLength={10}
                style={styles.textInput}
                value={mobile}
                onChangeText={text => {
                  setMobile(text);
                  clearError('mobile');
                }}
                returnKeyType="next"
              />
            </View>
            {errors.mobile && (
              <Text style={styles.errorText}>{errors.mobile}</Text>
            )}

            {/* Address */}
            <Text style={styles.label}>Address</Text>
            <View
              style={[
                styles.addressContainer,
                errors.address && styles.errorBorder,
              ]}
            >
              <MapPin
                size={22}
                color={COLORS.secondary}
                style={styles.addressIcon}
              />
              <TextInput
                placeholder="Enter street, city, state..."
                placeholderTextColor="#aaa"
                style={styles.addressInput}
                value={address}
                onChangeText={text => {
                  setAddress(text);
                  clearError('address');
                }}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                returnKeyType="done"
              />
            </View>
            {errors.address && (
              <Text style={styles.errorText}>{errors.address}</Text>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={loading} // ✅ prevent multiple clicks
            >
              <View style={styles.buttonContent}>
                {loading ? (
                  <Text style={styles.buttonText}>
                    {' '}
                    {isEditMode ? 'Updating....' : 'Saving....'}.
                  </Text>
                ) : (
                  <>
                    <Text style={styles.buttonText}>
                      {isEditMode ? 'Update Customer' : 'Save Customer'}
                    </Text>
                    <ChevronRight size={20} color="#fff" />
                  </>
                )}
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Discard modal */}
      <ConfirmModal
        visible={discardModal}
        title="Discard Changes?"
        message="Your changes will not be saved. Do you want to exit?"
        confirmText="Discard"
        cancelText="Keep Editing"
        danger={true}
        onCancel={() => setDiscardModal(false)}
        onConfirm={handleDiscard}
      />

      {/* Delete modal — edit mode only */}
      <ConfirmModal
        visible={deleteModal}
        title="Delete Customer?"
        message={`"${name}" will be permanently removed. This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        danger={true}
        onCancel={() => setDeleteModal(false)}
        onConfirm={handleDelete}
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },

  subtitle: {
    color: COLORS.secondary,
    fontSize: 16,
  },

  deleteIconBtn: {
    marginRight: 12,
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
  },

  scrollContent: {
    paddingBottom: 40,
  },

  headingBlock: {
    marginVertical: 20,
  },

  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },

  description: {
    color: '#6b7280',
    marginTop: 6,
    fontSize: 12,
  },

  label: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
    color: '#111',
  },

  optional: {
    fontWeight: '400',
    color: '#9ca3af',
    fontSize: 15,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    marginBottom: 10,
  },

  icon: {
    marginRight: 10,
  },

  textInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
    color: '#111',
  },

  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    marginBottom: 10,
    minHeight: 120,
  },

  addressIcon: {
    marginRight: 10,
    marginTop: 2,
  },

  addressInput: {
    flex: 1,
    fontSize: 15,
    color: '#111',
    lineHeight: 26,
  },

  errorBorder: {
    borderWidth: 2,
    borderColor: '#ef4444',
  },

  errorText: {
    color: '#ef4444',
    marginBottom: 10,
    marginLeft: 6,
    fontSize: 12,
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
    gap: 6,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
