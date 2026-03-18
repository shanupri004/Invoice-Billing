import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';

export default function StepIndicator({ step }) {
  const steps = ['Customer', 'Products', 'Summary'];

  return (
    <View style={styles.container}>
      {steps.map((label, index) => {
        const number = index + 1;
        const active = number === step;

        return (
          <React.Fragment key={index}>
            <View style={styles.step}>
              <View style={[styles.circle, active && styles.active]}>
                <Text
                  allowFontScaling
                  style={[styles.number, active && styles.activeText]}
                >
                  {number}
                </Text>
              </View>

              <Text allowFontScaling style={styles.label}>
                {label}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 24,
  },

  step: {
    alignItems: 'center',
    width: 90,
  },

  circle: {
    width: 38, // bigger circle
    height: 38,
    borderRadius: 23,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.secondary,
  },

  active: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  number: {
    fontWeight: 'bold',
    fontSize: 20, // bigger number
    color: COLORS.secondary,
  },

  activeText: {
    color: '#fff',
  },

  label: {
    fontSize: 16, // bigger label
    marginTop: 6,
    color: COLORS.secondary,
    textAlign: 'center',
    fontWeight: '600',
  },
});
