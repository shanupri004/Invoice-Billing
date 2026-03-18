import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CreateInvoiceStep1 from '../screens/CreateInvoiceStep1';
import CreateInvoiceStep2 from '../screens/CreateInvoiceStep2';
import CreateInvoiceStep3 from '../screens/CreateInvoiceStep3';

const Stack = createNativeStackNavigator();

export default function InvoiceStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="CreateInvoiceStep1" component={CreateInvoiceStep1} />
      <Stack.Screen name="CreateInvoiceStep2" component={CreateInvoiceStep2} />
      <Stack.Screen name="CreateInvoiceStep3" component={CreateInvoiceStep3} />
    </Stack.Navigator>
  );
}
