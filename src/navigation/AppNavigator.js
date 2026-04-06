import React, { useRef, useState } from 'react';
import { View, StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashBoard';
import CustomerForm from '../screens/CreateCustomer';
import InvoicePreview from '../screens/InvoicePreview';
import CustomerList from '../screens/CustomerList';
import InvoiceForm from '../screens/InvoiceForm';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const navigationRef = useRef();
  const [routeName, setRouteName] = useState('');

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        setRouteName(navigationRef.current.getCurrentRoute().name);
      }}
      onStateChange={() => {
        const currentRoute = navigationRef.current.getCurrentRoute().name;
        setRouteName(currentRoute);
      }}
    >
      {/* 🔥 Dynamic StatusBar */}
      <StatusBar
        barStyle={routeName === 'Splash' ? 'light-content' : 'dark-content'}
        backgroundColor={routeName === 'Splash' ? '#133C98' : '#F5F6FB'}
      />

      {/* 🔹 Fake StatusBar height */}
      {Platform.OS === 'android' && (
        <View
          style={{
            height: StatusBar.currentHeight,
            backgroundColor: routeName === 'Splash' ? '#133C98' : '#F5F6FB',
          }}
        />
      )}

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="customer" component={CustomerList} />
        <Stack.Screen name="CreateCustomer" component={CustomerForm} />
        <Stack.Screen name="InvoiceForm" component={InvoiceForm} />
        <Stack.Screen name="previewInvoice" component={InvoicePreview} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
