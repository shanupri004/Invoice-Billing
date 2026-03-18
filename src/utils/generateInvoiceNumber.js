import AsyncStorage from '@react-native-async-storage/async-storage';

export const generateInvoiceNumber = async () => {
  try {
    const year = new Date().getFullYear().toString().slice(-2);

    const storedInvoices = await AsyncStorage.getItem('invoices');

    const invoices = storedInvoices ? JSON.parse(storedInvoices) : [];

    if (invoices.length === 0) {
      return `INV-${year}-001`;
    }

    const lastInvoice = invoices[invoices.length - 1].invoiceNumber;

    const lastNumber = parseInt(lastInvoice.split('-')[2]);

    const newNumber = (lastNumber + 1).toString().padStart(3, '0');

    return `INV-${year}-${newNumber}`;
  } catch (error) {
    console.log('Invoice generator error:', error);
    return `INV-${new Date().getFullYear().toString().slice(-2)}-001`;
  }
};
