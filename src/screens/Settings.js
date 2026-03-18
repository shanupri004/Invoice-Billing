import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import { COLORS } from '../constants/Colors';
import { ChevronRight, LogOut, Trash2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import BottomNav from '../components/BottomNav';
import ConfirmModal from '../components/ConfirmModal';

export default function SettingScreen({ navigation }) {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const [logoutModal, setLogoutModal] = useState(false);
  const handleLogout = async () => {
    setLogoutModal(false);
    await AsyncStorage.removeItem('auth');
    navigation.replace('Login');
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f6fb" />
      <View style={styles.container}>
        {/* Fixed Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.section}>DATA MANAGEMENT</Text>

          <View style={styles.card}>
            <TouchableOpacity style={styles.row}>
              <Text style={styles.rowText}>Backup Data</Text>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.row}>
              <Text style={styles.rowText}>Export Invoices (.JSON)</Text>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.row}>
              <Text style={styles.rowText}>Restore Backup</Text>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <Text style={styles.section}>SYSTEM MAINTENANCE</Text>

          <View style={styles.card}>
            <TouchableOpacity style={styles.row}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Trash2 size={18} color="red" />
                <Text style={[styles.rowText, { color: 'red', marginLeft: 8 }]}>
                  Delete All Reports
                </Text>
              </View>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.row}
              onPress={() => setLogoutModal(true)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <LogOut size={18} color="#333" />
                <Text style={[styles.rowText, { marginLeft: 8 }]}>Logout</Text>
              </View>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>
          </View>
          <ConfirmModal
            visible={logoutModal}
            title="Are you sure?"
            message="You will be logged out of the system."
            confirmText="Logout"
            cancelText="Cancel"
            danger={true}
            onCancel={() => setLogoutModal(false)}
            onConfirm={handleLogout}
          />

          <Text style={styles.footer}>
            Aadhi Engine Service v2.4.0 (Build 2024)
          </Text>
        </ScrollView>

        {/* Bottom Navigation */}
        <BottomNav navigation={navigation} active="Settings" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },

  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#f4f6fb',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },

  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
    paddingLeft: 24,
    paddingRight: 24,
  },

  title: {
    fontSize: 36, // bigger title
    fontWeight: 'bold',
    marginBottom: 24,
  },

  section: {
    fontSize: 16, // bigger section label
    fontWeight: '700',
    color: '#6b7280',
    marginTop: 24,
    marginBottom: 12,
    letterSpacing: 1,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 3,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 22, // bigger touch area
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#f1f1f1',
  },

  rowText: {
    fontSize: 20, // large readable text
    fontWeight: '600',
    color: '#111',
  },

  footer: {
    textAlign: 'center',
    marginTop: 50,
    color: '#9ca3af',
    fontSize: 14,
  },
});
