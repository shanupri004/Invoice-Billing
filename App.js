import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { LanguageProvider } from './src/localization/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <AppNavigator />
    </LanguageProvider>
  );
}
