import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/Colors';
import Icon from '../assets/svg/setting.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const loadingTexts = [
  'Initializing System...',
  'Connecting Services...',
  'Loading Modules...',
  'Preparing Dashboard...',
  'Almost Ready...',
];

export default function SplashScreen({ navigation }) {
  const [textIndex, setTextIndex] = useState(0);
  useEffect(() => {
    const textInterval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % loadingTexts.length);
    }, 1000);

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 5000);

    return () => {
      clearInterval(textInterval);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const checkLogin = async () => {
      const data = await AsyncStorage.getItem('auth');

      if (data) {
        const auth = JSON.parse(data);

        const now = Date.now();
        const diff = now - auth.loginTime;

        const oneDay = 24 * 60 * 60 * 1000;

        if (auth.isAuthenticated && diff < oneDay) {
          navigation.replace('Dashboard');
          return;
        }
      }

      navigation.replace('Login');
    };
    setTimeout(checkLogin, 5000);
  }, []);

  return (
    <View style={styles.container}>
      <Icon width={50} height={50} style={{ marginBottom: 15 }} />
      <Text style={styles.logo}>Aadhi Engine</Text>
      <Text style={styles.logo}>Services</Text>
      <Text style={styles.sub}>OFFLINE BILLING SYSTEM</Text>

      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>{loadingTexts[textIndex]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Monotype-Corsiva-Regular',
  },
  sub: {
    color: 'white',
    marginTop: 10,
  },
  loader: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 15,
    fontSize: 16,
  },
});
