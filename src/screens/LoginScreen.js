import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/Colors';
import Logo from '../assets/svg/Logo.svg';
import { LoginService } from '../services/Login';

const APP_VERSION = 'v2.4.0';

export default function LoginScreen({ navigation }) {
  const [pin, setPin] = useState('');

  const handlePress = num => {
    if (pin.length >= 4) return;
    const newPin = pin + num;
    setPin(newPin);
    if (newPin.length === 4) handleLogin(newPin);
  };

  const handleDelete = () => setPin(prev => prev.slice(0, -1));

  const handleLogin = async enteredPin => {
    try {
      const res = await LoginService.loginWithPin(enteredPin);

      if (res.success) {
        navigation.replace('Dashboard');
      } else {
        Alert.alert('Error', res.message);
        setPin('');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {[0, 1, 2, 3].map(i => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor:
                i < pin.length ? COLORS.primary : COLORS.dotEmpty,
            },
          ]}
        />
      ))}
    </View>
  );

  const KeypadButton = ({ label, onPress }) => (
    <TouchableOpacity
      style={styles.key}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={`Key ${label}`}
    >
      <Text style={styles.keyText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ── Header Section ── */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Logo style={styles.logoSvg} />
          </View>
          <Text style={styles.company}>Aadhi Engine Services</Text>
          <View style={styles.divider} />
        </View>

        {/* ── PIN Section ── */}
        <View style={styles.pinSection}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Enter your 4-digit PIN to continue
          </Text>
          {renderDots()}
        </View>

        {/* ── Keypad ── */}
        <View style={styles.keypadWrapper}>
          <View style={styles.keypad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <KeypadButton
                key={num}
                label={String(num)}
                onPress={() => handlePress(String(num))}
              />
            ))}
            <View style={styles.keyEmpty} />
            <KeypadButton label="0" onPress={() => handlePress('0')} />
            <TouchableOpacity
              style={styles.key}
              onPress={handleDelete}
              activeOpacity={0.7}
              accessibilityLabel="Delete"
            >
              <Text style={styles.keyText}>⌫</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footerSection}>
          <Text style={styles.footerLabel}>OFFLINE BILLING SYSTEM</Text>
          <Text style={styles.footerVersion}>{APP_VERSION}</Text>
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },

  // ── Header ──────────────────────────────────────
  headerSection: {
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    top: 40,
  },

  logoContainer: {
    height: 72,
    width: 72,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    // Subtle shadow for depth
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },

  logoSvg: {
    width: '60%',
    height: '60%',
  },

  company: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text ?? '#1a1a2e',
    letterSpacing: 0.3,
    marginBottom: 16,
  },

  divider: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.5,
  },

  // ── PIN Section ──────────────────────────────────
  pinSection: {
    alignItems: 'center',
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 6,
    letterSpacing: 0.2,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.secondary ?? '#888',
    marginBottom: 28,
    letterSpacing: 0.1,
  },

  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },

  dot: {
    width: 20,
    height: 20,
    borderRadius: 7,
  },

  // ── Keypad ──────────────────────────────────────
  keypadWrapper: {
    width: '100%',
    alignItems: 'center',
  },

  keypad: {
    width: '85%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    rowGap: 12,
    columnGap: 0,
  },

  key: {
    width: '30%',
    height: 40,
    aspectRatio: 1.4,
    marginHorizontal: '1.5%',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    // Crisp card shadow
    shadowColor: '#b0bec5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },

  keyText: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.primary,
  },

  keyEmpty: {
    width: '30%',
    marginHorizontal: '1.5%',
  },

  // ── Footer ──────────────────────────────────────
  footerSection: {
    alignItems: 'center',
    gap: 2,
  },

  footerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#b0b8c8',
    letterSpacing: 1.5,
  },

  footerVersion: {
    fontSize: 11,
    color: '#c8cdd8',
    letterSpacing: 0.5,
  },
});
