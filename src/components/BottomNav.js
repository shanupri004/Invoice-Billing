import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, PlusCircle, FileText, Settings } from 'lucide-react-native';
import { COLORS } from '../constants/Colors';

export default function BottomNav({ navigation, active }) {
  const tabs = [
    { name: 'Home', icon: Home, screen: 'Dashboard' },
    { name: 'Create', icon: PlusCircle, screen: 'InvoiceFlow' },
    { name: 'Invoices', icon: FileText, screen: 'Invoices' },
    { name: 'Settings', icon: Settings, screen: 'Settings' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = active === tab.name;

        return (
          <TouchableOpacity
            key={index}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.screen)}
          >
            <Icon
              size={32}
              color={isActive ? COLORS.primary : COLORS.secondary}
            />
            <Text
              style={[
                styles.label,
                { color: isActive ? COLORS.primary : COLORS.secondary },
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0, // ✅ important

    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',

    backgroundColor: '#fff',
    paddingVertical: 12,

    borderTopWidth: 1,
    borderColor: '#eee',
    paddingBottom: 20,

    elevation: 8,
  },

  tab: {
    alignItems: 'center',
  },

  label: {
    fontSize: 20,
    marginTop: 3,
  },
});
