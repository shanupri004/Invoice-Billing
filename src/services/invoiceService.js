// src/services/invoiceService.js

import { supabase } from '../lib/supabase';

// ─────────────────────────────────────────────
// 🔹 DB → App Model
// ─────────────────────────────────────────────

const mapInvoice = row => ({
  id: row.id,
  invoiceCode: row.invoice_code,
  invoiceType: row.invoice_type,
  invoiceDate: row.invoice_date,

  customerId: row.customer_id,

  paymentStatus: row.payment_status,
  paymentMode: row.payment_mode,

  items: row.items || [],

  totalAmount: Number(row.total_amount),

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

const toInvoice = payload => ({
  invoice_type: payload.invoiceType, // PRODUCT | LABOUR
  invoice_date: payload.invoiceDate,

  customer_id: payload.customerId,

  payment_status: payload.paymentStatus || 'PENDING',
  payment_mode: payload.paymentMode || null,

  items: payload.items || [],

  total_amount: payload.totalAmount,

  is_deleted: false,
});

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

    return mapInvoice(data);
  },

  // ✅ Update

  async update(id, payload) {
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

    return mapInvoice(data);
  },

  // ✅ Update payment status

  async updatePaymentStatus(
    id,
    paymentStatus,
    paymentMode = null,
  ) {
    const { data, error } = await supabase
      .from('invoice')
      .update({
        payment_status: paymentStatus,
        payment_mode: paymentMode,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return mapInvoice(data);
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