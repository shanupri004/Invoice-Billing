import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashBoard';
import SettingScreen from '../screens/Settings';
import InvoiceStack from './InvoiceStack';
import InvoicePreview from '../screens/InvoicePreview';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Settings" component={SettingScreen} />

        {/* Invoice Flow */}
        <Stack.Screen name="InvoiceFlow" component={InvoiceStack} />
        <Stack.Screen name="previewInvoice" component={InvoicePreview} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
