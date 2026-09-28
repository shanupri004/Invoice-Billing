import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useTranslation } from '../localization/LanguageContext';
import { invoiceService } from '../services/invoiceService';
import { notificationService } from '../services/notificationService';

export default function PendingInvoiceReminderSync() {
  const { language } = useTranslation();
  const permissionRequested = useRef(false);

  useEffect(() => {
    let active = true;

    const syncReminders = async () => {
      try {
        if (!(await notificationService.isEnabled())) return;
        if (!permissionRequested.current) {
          permissionRequested.current = true;
          await notificationService.requestPermission();
        }
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