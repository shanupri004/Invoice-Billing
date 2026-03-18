import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Lock, Eye, EyeOff } from 'lucide-react-native';
import { COLORS } from '../constants/Colors';
import Logo from '../assets/svg/Logo.svg';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (username === 'iyappan' && password === 'priya') {
      const loginData = {
        isAuthenticated: true,
        loginTime: Date.now(),
      };

      await AsyncStorage.setItem('auth', JSON.stringify(loginData));

      navigation.replace('Dashboard');
    } else {
      Alert.alert('Login Failed', 'Invalid username or password');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* Logo */}
            <View style={styles.logo}>
              <Logo style={{ width: '100%', height: '100%' }} />
            </View>

            <Text allowFontScaling style={styles.company}>
              Aadhi Engine Services
            </Text>

            <Text allowFontScaling style={styles.title}>
              Login
            </Text>

            <Text allowFontScaling style={styles.subtitile}>
              Please enter your credentials to continue
            </Text>

            <View style={styles.loginContainer}>
              {/* Username */}
              <Text allowFontScaling style={styles.label}>
                Username
              </Text>

              <View style={styles.inputContainer}>
                <User size={26} color="#999" style={styles.icon} />

                <TextInput
                  placeholder="Enter your username"
                  placeholderTextColor="#aaa"
                  autoCapitalize="none"
                  style={styles.textInput}
                  value={username}
                  onChangeText={setUsername}
                />
              </View>

              {/* Password */}
              <Text allowFontScaling style={styles.label}>
                Password
              </Text>

              <View style={styles.inputContainer}>
                <Lock size={26} color="#999" style={styles.icon} />

                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#aaa"
                  secureTextEntry={!showPassword}
                  style={styles.textInput}
                  value={password}
                  onChangeText={setPassword}
                />

                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={26} color="#999" />
                  ) : (
                    <Eye size={26} color="#999" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text allowFontScaling style={styles.buttonText}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <Text allowFontScaling style={styles.footer}>
              OFFLINE BILLING SYSTEM{'\n'}
              v2.4.0 - Local Network Mode
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f6fb',
  },

  logo: {
    height: 90,
    width: 90,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  company: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 28,
    color: 'black',
  },

  title: {
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.primary,
    marginBottom: 8,
  },

  subtitile: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: COLORS.secondary,
    marginBottom: 36,
  },

  loginContainer: {
    width: '100%',
  },

  label: {
    color: 'black',
    marginBottom: 6,
    fontSize: 20,
    fontWeight: 'bold',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginBottom: 22,
    elevation: 3,
  },

  icon: {
    marginRight: 12,
  },

  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 20,
    color: 'black',
  },

  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 20,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },

  footer: {
    textAlign: 'center',
    marginTop: 60,
    color: '#999',
    fontSize: 16,
    lineHeight: 22,
  },
});
