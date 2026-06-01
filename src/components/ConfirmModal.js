import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Icon */}
          <View style={styles.iconCircle}>
            <AlertTriangle size={30} color="#ef4444" />
          </View>

          {/* Title */}
          <Text allowFontScaling style={styles.title}>
            {title}
          </Text>

          {/* Message */}
          <Text allowFontScaling style={styles.message}>
            {message}
          </Text>

          {/* Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text allowFontScaling style={styles.cancelText}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Text
                allowFontScaling
                style={[styles.confirmText, danger && { color: '#ef4444' }]}
              >
                {confirmText}
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },

  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  title: {
    fontSize: 20, // larger title
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },

  message: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 16, // larger message
    lineHeight: 24,
    marginBottom: 26,
  },

  actions: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#eee',
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 20, // bigger touch area
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#eee',
  },

  confirmBtn: {
    flex: 1,
    paddingVertical: 20,
    alignItems: 'center',
  },

  cancelText: {
    fontSize: 16, // larger button text
    color: '#374151',
    fontWeight: '600',
  },

  confirmText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
