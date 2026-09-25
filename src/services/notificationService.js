import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {
  AuthorizationStatus,
  TriggerType,
} from '@notifee/react-native';
import en from '../localization/en';
import hi from '../localization/hi';
import kn from '../localization/kn';
import ml from '../localization/ml';
import ta from '../localization/ta';
import te from '../localization/te';

const ENABLED_KEY = 'pendingInvoiceRemindersEnabled';
const ENABLED_AT_KEY = 'pendingInvoiceRemindersEnabledAt';
const LANGUAGE_KEY = 'appLanguage';
const CHANNEL_ID = 'pending-invoice-reminders';
const NOTIFICATION_PREFIX = 'pending-invoice:';
const WEEKLY_SUMMARY_ID = `${NOTIFICATION_PREFIX}weekly-summary`;
const REMINDER_DAYS = [3, 7];
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const dictionaries = { en, hi, kn, ml, ta, te };

const getText = (language, key, values = {}) => {
  const dictionary = dictionaries[language] || dictionaries.en;
  const template = dictionary.notifications?.[key] || en.notifications[key];

  return template.replace(/{{\s*(\w+)\s*}}/g, (match, name) =>
    values[name] !== undefined ? String(values[name]) : match,
  );
};

const reminderId = (invoiceId, days) =>
  `${NOTIFICATION_PREFIX}${invoiceId}:${days}`;

const formatAmount = amount =>
  `₹${Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;

const getNextMondayAtNine = () => {
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setHours(9, 0, 0, 0);

  let daysUntilMonday = (8 - nextMonday.getDay()) % 7;
  if (daysUntilMonday === 0 && nextMonday.getTime() <= now.getTime()) {
    daysUntilMonday = 7;
  }
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
  return nextMonday.getTime();
};

const createReminder = (invoice, language, days, timestamp, idSuffix = days) => {
  const customer = invoice.customer?.name || getText(language, 'unknownCustomer');
  const amount = formatAmount(invoice.totalAmount);
  const id = reminderId(invoice.id, idSuffix);

  return {
    id,
    timestamp,
    notification: {
      id,
      title: getText(language, 'pendingTitle'),
      body: getText(language, 'pendingMessage', {
        customer,
        billNo: invoice.billNo || invoice.bill_no || '',
        amount,
        days,
      }),
      data: { invoiceId: String(invoice.id), language },
      android: {
        channelId: CHANNEL_ID,
        pressAction: { id: 'default' },
      },
    },
  };
};

const createInvoiceActivityNotification = (invoice, language, type) => {
  const isPayment = type === 'payment';
  const id = `${type === 'payment' ? 'payment-received' : 'invoice-created'}:${invoice.id}`;
  const amount = formatAmount(invoice.totalAmount);
  const customer = invoice.customer?.name || getText(language, 'unknownCustomer');

  return {
    id,
    title: getText(
      language,
      isPayment ? 'paymentReceivedTitle' : 'invoiceCreatedTitle',
    ),
    body: getText(
      language,
      isPayment ? 'paymentReceivedMessage' : 'invoiceCreatedMessage',
      {
        billNo: invoice.billNo || invoice.bill_no || '',
        customer,
        amount,
      },
    ),
    data: { invoiceId: String(invoice.id), language, type },
    android: {
      channelId: CHANNEL_ID,
      pressAction: { id: 'default' },
    },
  };
};

const createWeeklySummary = invoices => {
  const pendingInvoices = invoices.filter(
    invoice => invoice.paymentStatus?.toUpperCase() === 'PENDING',
  );
  if (pendingInvoices.length === 0) return null;

  return {
    id: WEEKLY_SUMMARY_ID,
    timestamp: getNextMondayAtNine(),
    count: pendingInvoices.length,
    amount: pendingInvoices.reduce(
      (total, invoice) => total + Number(invoice.totalAmount || 0),
      0,
    ),
  };
};

const getInvoiceReminders = (
  invoice,
  language,
  now = Date.now(),
  fallbackAnchor = 0,
) => {
  if (
    !invoice?.id ||
    invoice.paymentStatus?.toUpperCase() !== 'PENDING' ||
    !invoice.createdAt
  ) {
    return [];
  }

  const createdAt = new Date(invoice.createdAt).getTime();
  if (!Number.isFinite(createdAt)) return [];

  const reminders = REMINDER_DAYS.flatMap(days => {
    const timestamp = createdAt + days * DAY_IN_MS;
    if (timestamp <= now) return [];

    return [createReminder(invoice, language, days, timestamp)];
  });

  if (reminders.length > 0) return reminders;

  const timestamp = Math.max(createdAt, fallbackAnchor) + DAY_IN_MS;
  if (timestamp <= now) return [];

  const days = Math.ceil((timestamp - createdAt) / DAY_IN_MS);
  return [createReminder(invoice, language, days, timestamp, 'catchup')];
};

const ensureChannel = async language => {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: getText(language, 'channelName'),
    importance: 3,
  });
};

const getReminderIds = async () => {
  const ids = await notifee.getTriggerNotificationIds();
  return ids.filter(id => id.startsWith(NOTIFICATION_PREFIX));
};

const cancelIds = async ids => {
  await Promise.all(ids.map(id => notifee.cancelTriggerNotification(id)));
};

export const notificationService = {
  async isEnabled() {
    return (await AsyncStorage.getItem(ENABLED_KEY)) === 'true';
  },

  async enable(language) {
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED) {
      return false;
    }

    await AsyncStorage.setItem(ENABLED_KEY, 'true');
    await AsyncStorage.setItem(ENABLED_AT_KEY, String(Date.now()));
    await ensureChannel(language);
    return true;
  },

  async disable() {
    await AsyncStorage.removeItem(ENABLED_KEY);
    await AsyncStorage.removeItem(ENABLED_AT_KEY);
    await this.cancelAll();
  },

  async cancelAll() {
    await cancelIds(await getReminderIds());
  },

  async notifyInvoiceCreated(invoice) {
    await this.showActivity(invoice, 'invoice');
  },

  async notifyPaymentReceived(invoice) {
    await this.showActivity(invoice, 'payment');
  },

  async showActivity(invoice, type) {
    if (!(await this.isEnabled())) return;

    const language = (await AsyncStorage.getItem(LANGUAGE_KEY)) || 'en';
    await ensureChannel(language);
    await notifee.displayNotification(
      createInvoiceActivityNotification(invoice, language, type),
    );
  },

  async syncAll(invoices, language) {
    if (!(await this.isEnabled())) {
      await this.cancelAll();
      return;
    }

    const selectedLanguage =
      language || (await AsyncStorage.getItem(LANGUAGE_KEY)) || 'en';
    await ensureChannel(selectedLanguage);
    const enabledAt = Number(await AsyncStorage.getItem(ENABLED_AT_KEY)) || 0;
    const reminders = invoices.flatMap(invoice => {
      const updatedAt = new Date(invoice.updatedAt || 0).getTime() || 0;
      return getInvoiceReminders(
        invoice,
        selectedLanguage,
        Date.now(),
        Math.max(enabledAt, updatedAt),
      );
    });
    const weeklySummary = createWeeklySummary(invoices);
    if (weeklySummary) {
      reminders.push({
        id: WEEKLY_SUMMARY_ID,
        timestamp: weeklySummary.timestamp,
        notification: {
          id: WEEKLY_SUMMARY_ID,
          title: getText(selectedLanguage, 'weeklyTitle'),
          body: getText(selectedLanguage, 'weeklyMessage', {
            count: weeklySummary.count,
            amount: formatAmount(weeklySummary.amount),
          }),
          data: { type: 'weekly-summary', language: selectedLanguage },
          android: {
            channelId: CHANNEL_ID,
            pressAction: { id: 'default' },
          },
        },
      });
    }
    const reminderIds = await getReminderIds();
    await cancelIds(reminderIds);

    for (const reminder of reminders) {
      await notifee.createTriggerNotification(reminder.notification, {
        type: TriggerType.TIMESTAMP,
        timestamp: reminder.timestamp,
      });
    }
  },
};