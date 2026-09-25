import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { RefreshCw } from 'lucide-react-native';
import { useTranslation } from '../localization/LanguageContext';
import Text from './AppText';

const SHOW_POPUP_FOR_TESTING = false;

export default function NetworkStatusModal() {
  const { t } = useTranslation();

  const [visible, setVisible] = useState(SHOW_POPUP_FOR_TESTING);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected === false) {
        setVisible(true);
      } else if (state.isConnected === true) {
        setVisible(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);

    try {
      const state = await NetInfo.fetch();

      if (state.isConnected) {
        setVisible(false);
      } else {
        setVisible(true);
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>

          {/* Illustration */}
          <Image
            source={require('../assets/network-offline.png')}
            style={styles.illustration}
            resizeMode="contain"
          />

          {/* Content */}
          <View style={styles.content}>
            <Text allowFontScaling style={styles.title}>
              {t('network.offlineTitle')}
            </Text>

            <Text allowFontScaling style={styles.message}>
              {t('network.offlineMessage')}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.8}
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text allowFontScaling style={styles.cancelButtonText}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.85}
              style={styles.retryButton}
              onPress={handleRetry}
              disabled={isRetrying}
            >
              <RefreshCw
                size={18}
                color="#fff"
                style={isRetrying ? styles.rotatingIcon : undefined}
              />

              <Text allowFontScaling style={styles.retryButtonText}>
                {isRetrying
                  ? t('common.retrying')
                  : t('common.tryAgain')}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 15,
  },

  illustration: {
    width: '100%',
    height: 250,
    marginTop: 4,
  },

  content: {
    width: '100%',
    paddingHorizontal: 28,
    alignItems: 'center',
    paddingTop: 2,
  },

  title: {
    color: '#0F1B3D',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },

  message: {
    color: '#64748B',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 340,
  },

  actions: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 26,
  },

  cancelButton: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: '#1769FF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  cancelButtonText: {
    color: '#1769FF',
    fontSize: 16,
    fontWeight: '700',
  },

  retryButton: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1769FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,

    shadowColor: '#1769FF',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  rotatingIcon: {
    opacity: 0.7,
  },
});