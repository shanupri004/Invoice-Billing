import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, PlusCircle, FileText, BicepsFlexed } from 'lucide-react-native';
import { COLORS } from '../constants/Colors';
import { useTranslation } from '../localization/LanguageContext';
import Text from './AppText';

export default function BottomNav({ navigation, active }) {
  const { t } = useTranslation();
  const tabs = [
    { name: 'Home', label: t('bottomNav.home'), icon: Home, screen: 'Dashboard' },
    { name: 'Create', label: t('bottomNav.create'), icon: PlusCircle, screen: 'InvoiceForm' },
    { name: 'Labour', label: t('bottomNav.labour'), icon: BicepsFlexed, screen: 'LabourInvoiceForm' },
    { name: 'Invoices', label: t('bottomNav.invoices'), icon: FileText, screen: 'InvoiceList' },
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
              {tab.label}
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
    fontFamily: 'Roboto' 
  },
});
