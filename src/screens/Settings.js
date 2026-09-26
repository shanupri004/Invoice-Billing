import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { COLORS } from '../constants/Colors';
import { ChevronLeft, ChevronRight, LogOut, Languages } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from '../components/BottomNav';
import ConfirmModal from '../components/ConfirmModal';
import { useTranslation } from '../localization/LanguageContext';
import Text from '../components/AppText';
import { invoiceService } from '../services/invoiceService';
import { notificationService } from '../services/notificationService';

export default function SettingScreen({ navigation }) {
  const { t, language, setLanguage } = useTranslation();
  const [logoutModal, setLogoutModal] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [savingReminderSetting, setSavingReminderSetting] = useState(true);

  React.useEffect(() => {
    let active = true;
    Promise.all([
      notificationService.isEnabled(),
      notificationService.hasPermission(),
    ]).then(([enabled, permitted]) => {
      if (active) {
        setRemindersEnabled(enabled && permitted);
        setSavingReminderSetting(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const handleReminderToggle = async enabled => {
    setSavingReminderSetting(true);
    try {
      if (enabled) {
        const granted = await notificationService.enable(language);
        if (!granted) {
          Alert.alert(
            t('notifications.permissionTitle'),
            t('notifications.permissionMessage'),
          );
          return;
        }

        setRemindersEnabled(true);
        const invoices = await invoiceService.getAll();
        await notificationService.syncAll(invoices, language);
      } else {
        await notificationService.disable();
        setRemindersEnabled(false);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('notifications.setupFailed'));
    } finally {
      setSavingReminderSetting(false);
    }
  };

  const handleLogout = async () => {
    setLogoutModal(false);
    await AsyncStorage.removeItem('auth');
    navigation.replace('Login');
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'ml', label: 'മലയാളം' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={8}
            style={styles.backButton}
          >
            <ChevronLeft size={26} color="#111" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('settings.title')}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Language */}
          <Text style={styles.section}>
            {t('settings.language')}
          </Text>

          <View style={styles.card}>
            <View style={styles.languageHeader}>
              <View style={styles.iconContainer}>
                <Languages size={20} color="#333" />
              </View>

              <View style={styles.languageHeaderText}>
                <Text style={styles.rowText}>
                  {t('settings.appLanguage')}
                </Text>

                <Text style={styles.selectedLanguage}>
                  {languages.find(item => item.code === language)?.label}
                </Text>
              </View>
            </View>

            <View style={styles.languageList}>
              {languages.map(item => {
                const isActive = language === item.code;

                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.languageOption,
                      isActive && styles.languageOptionActive,
                    ]}
                    onPress={() => setLanguage(item.code)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.languageOptionText,
                        isActive && styles.languageOptionTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>

                    {isActive && (
                      <View style={styles.activeIndicator} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Text style={styles.section}>
            {t('notifications.sectionTitle')}
          </Text>

          <View style={styles.card}>
            <View style={styles.notificationRow}>
              <View style={styles.notificationCopy}>
                <Text style={styles.rowText}>
                  {t('notifications.paymentReminders')}
                </Text>
                <Text style={styles.notificationDescription}>
                  {t('notifications.paymentRemindersDescription')}
                </Text>
              </View>
              <Switch
                value={remindersEnabled}
                disabled={savingReminderSetting}
                onValueChange={handleReminderToggle}
                trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
              />
            </View>
          </View>

          {/* Logout */}
          <Text style={styles.section}>
            {t('settings.systemMaintenance')}
          </Text>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => setLogoutModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <View style={styles.iconContainer}>
                  <LogOut size={19} color="#333" />
                </View>

                <Text style={styles.rowText}>
                  {t('settings.logout')}
                </Text>
              </View>

              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Logout Confirmation */}
          <ConfirmModal
            visible={logoutModal}
            title={t('settings.logoutConfirmTitle')}
            message={t('settings.logoutConfirmMessage')}
            confirmText={t('settings.logout')}
            cancelText={t('common.cancel')}
            danger={true}
            onCancel={() => setLogoutModal(false)}
            onConfirm={handleLogout}
          />

          <Text style={styles.footer}>
            {t('settings.footer')}
          </Text>
        </ScrollView>

        {/* Bottom Navigation */}
        <BottomNav
          navigation={navigation}
          active="Settings"
        />
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
    backgroundColor: '#f4f6fb',
    paddingHorizontal: 24,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#f4f6fb',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 2,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  scrollContent: {
    paddingBottom: 30,
  },

  section: {
    fontSize: 15,
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

  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: '#f1f1f1',
  },

  languageHeaderText: {
    marginLeft: 12,
  },

  selectedLanguage: {
    marginTop: 3,
    fontSize: 14,
    color: '#6b7280',
  },

  languageList: {
    padding: 8,
  },

  notificationRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  notificationCopy: {
    flex: 1,
    paddingRight: 12,
  },

  notificationDescription: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
  },

  languageOption: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  languageOptionActive: {
    backgroundColor: COLORS.primary,
  },

  languageOptionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
  },

  languageOptionTextActive: {
    color: '#fff',
  },

  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },

  row: {
    minHeight: 68,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowText: {
    fontSize: 19,
    fontWeight: '600',
    color: '#111',
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    textAlign: 'center',
    marginTop: 40,
    color: '#9ca3af',
    fontSize: 14,
  },
});