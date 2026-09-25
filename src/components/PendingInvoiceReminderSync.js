import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useTranslation } from '../localization/LanguageContext';
import { invoiceService } from '../services/invoiceService';
import { notificationService } from '../services/notificationService';

export default function PendingInvoiceReminderSync() {
  const { language } = useTranslation();

  useEffect(() => {
    let active = true;

    const syncReminders = async () => {
      try {
        if (!(await notificationService.isEnabled())) return;
        const invoices = await invoiceService.getAll();
        if (active) await notificationService.syncAll(invoices, language);
      } catch (error) {
        console.warn('Unable to sync invoice reminders:', error);
      }
    };

    syncReminders();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') syncReminders();
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, [language]);

  return null;
}