// src/services/invoiceService.js

import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';

const refreshNotificationSchedules = async () => {
  try {
    const invoices = await invoiceService.getAll();
    await notificationService.syncAll(invoices);
  } catch (error) {
    console.warn('Unable to refresh invoice notifications:', error);
  }
};

const getPaymentStatus = async id => {
  const { data, error } = await supabase
    .from('invoice')
    .select('payment_status')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data.payment_status;
};

const notifySafely = async (method, invoice) => {
  try {
    await notificationService[method](invoice);
  } catch (error) {
    console.warn('Unable to display invoice notification:', error);
  }
};

// ─────────────────────────────────────────────
// 🔹 DB → App Model
// ─────────────────────────────────────────────

const mapInvoice = row => ({
  id: row.id,
  // invoiceCode: row.invoice_code,
  invoiceType: row.invoice_type,
  invoiceDate: row.invoice_date,

  customerId: row.customer_id,

  paymentStatus: row.payment_status,
  paymentMode: row.payment_mode,

  items: row.items || [],

  totalAmount: Number(row.total_amount),
  billNo: row.bill_no,

  createdAt: row.created_at,
  updatedAt: row.updated_at,

  customer: row.customer
    ? {
        id: row.customer.id,
        name: row.customer.name,
        mobile: row.customer.mobile,
      }
    : null,
});

// ─────────────────────────────────────────────
// 🔹 App → DB Model
// ─────────────────────────────────────────────

const toInvoice = payload => {
  console.log(payload, 'in service');

  return {
    invoice_type: payload.invoiceType,
    invoice_date: payload.invoiceDate,
    customer_id: payload.customerId,

    payment_status: payload.paymentStatus || 'PENDING',
    payment_mode: payload.paymentMode || null,

    items: payload.items || [],

    total_amount: payload.totalAmount,
    bill_no: payload.bill_no,

    is_deleted: false,
  };
};

// ─────────────────────────────────────────────
// 🚀 Service
// ─────────────────────────────────────────────

export const invoiceService = {
  // ✅ Get all invoices

  async getAll() {
    const { data, error } = await supabase
      .from('invoice')
      .select(`
        *,
        customer (
          id,
          name,
          mobile
        )
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(mapInvoice);
  },

  // ✅ Get by ID

  async getById(id) {
    const { data, error } = await supabase
      .from('invoice')
      .select(`
        *,
        customer (
          id,
          name,
          mobile
        )
      `)
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;

    return mapInvoice(data);
  },

  
  // ✅ Create

  async create(payload) {
    const { data, error } = await supabase
      .from('invoice')
      .insert([toInvoice(payload)])
      .select(`
        *,
        customer (
          id,
          name,
          mobile
        )
      `)
      .single();

  if (error) throw error;

  const invoice = mapInvoice(data);

  await notifySafely('notifyInvoiceCreated', invoice);
  await refreshNotificationSchedules();

  return invoice;
},

  // ✅ Update

  async update(id, payload) {
    const previousPaymentStatus = await getPaymentStatus(id);
    const { data, error } = await supabase
      .from('invoice')
      .update({
        ...toInvoice(payload),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        customer (
          id,
          name,
          mobile
        )
      `)
      .single();

    if (error) throw error;

    const invoice = mapInvoice(data);
    if (
      previousPaymentStatus?.toUpperCase() !== 'PAID' &&
      invoice.paymentStatus?.toUpperCase() === 'PAID'
    ) {
      await notifySafely('notifyPaymentReceived', invoice);
    }
    await refreshNotificationSchedules();
    return invoice;
  },

  // ✅ Update payment status

  async updatePaymentStatus(
    id,
    paymentStatus,
    paymentMode = null,
  ) {
    const previousPaymentStatus = await getPaymentStatus(id);
    const { data, error } = await supabase
      .from('invoice')
      .update({
        payment_status: paymentStatus,
        payment_mode: paymentMode,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        customer (
          id,
          name,
          mobile
        )
      `)
      .single();

    if (error) throw error;

    const invoice = mapInvoice(data);
    if (
      previousPaymentStatus?.toUpperCase() !== 'PAID' &&
      invoice.paymentStatus?.toUpperCase() === 'PAID'
    ) {
      await notifySafely('notifyPaymentReceived', invoice);
    }
    await refreshNotificationSchedules();
    return invoice;
  },

  // ✅ Mark Paid Shortcut

  async markAsPaid(id, paymentMode) {
    return this.updatePaymentStatus(
      id,
      'PAID',
      paymentMode,
    );
  },

  // ✅ Soft Delete

  async remove(id) {
    const { error } = await supabase
      .from('invoice')
      .update({
        is_deleted: true,
      })
      .eq('id', id);

    if (error) throw error;

    await refreshNotificationSchedules();

    return true;
  },

  // ✅ Get Product Invoices

  async getProductInvoices() {
    const { data, error } = await supabase
      .from('invoice')
      .select('*')
      .eq('invoice_type', 'PRODUCT')
      .eq('is_deleted', false)
      .order('created_at', {
        ascending: false,
      });

    if (error) throw error;

    return data.map(mapInvoice);
  },

  // ✅ Get Labour Invoices

  async getLabourInvoices() {
    const { data, error } = await supabase
      .from('invoice')
      .select('*')
      .eq('invoice_type', 'LABOUR')
      .eq('is_deleted', false)
      .order('created_at', {
        ascending: false,
      });

    if (error) throw error;

    return data.map(mapInvoice);
  },
};