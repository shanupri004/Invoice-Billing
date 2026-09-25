import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { LanguageProvider } from './src/localization/LanguageContext';
import PendingInvoiceReminderSync from './src/components/PendingInvoiceReminderSync';

export default function App() {
  return (
    <LanguageProvider>
      <>
        <PendingInvoiceReminderSync />
        <AppNavigator />
      </>
    </LanguageProvider>
  );
}
