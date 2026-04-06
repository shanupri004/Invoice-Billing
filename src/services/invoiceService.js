// src/services/invoiceService.js
import { supabase } from '../lib/supabase';

console.log('SUPABASE CHECK:', supabase);

// ─────────────────────────────────────────────
// 🔹 DB → App Model
// ─────────────────────────────────────────────

const mapInvoice = row => ({
  id: row.id,
  invoiceCode: row.invoice_code,
  customerId: row.customer_id,
  grandTotal: Number(row.grand_total),
  status: row.status,
  paymentMode: row.payment_mode,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapInvoiceItem = row => ({
  id: row.id,
  invoiceId: row.invoice_id,
  productName: row.product_name,
  quantity: row.quantity,
  price: Number(row.price),
});

// ─────────────────────────────────────────────
// 🔹 App → DB Model
// ─────────────────────────────────────────────

const toInvoice = payload => ({
  customer_id: payload.customerId,
  grand_total: payload.grandTotal,
  status: payload.status || 'PENDING',
  payment_mode: payload.paymentMode || null,
  is_deleted: false,
});

const toInvoiceItems = (items, invoiceId) =>
  items.map(i => ({
    invoice_id: invoiceId,
    product_name: i.name,
    quantity: i.quantity,
    price: i.price,
    is_deleted: false,
  }));

// ─────────────────────────────────────────────
// 🚀 Service
// ─────────────────────────────────────────────

export const invoiceService = {
  // ✅ Get all invoices
  async getAll() {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(mapInvoice);
  },

  // ✅ Get single invoice with items
  async getById(id) {
    const { data, error } = await supabase
      .from('invoices')
      .select(
        `
        *,
        invoice_items (*)
      `,
      )
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;

    return {
      ...mapInvoice(data),
      items: data.invoice_items.map(mapInvoiceItem),
    };
  },

  // ✅ Create invoice + items (IMPORTANT)
  async create(payload) {
    // 1️⃣ Insert invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([toInvoice(payload)])
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // 2️⃣ Insert items
    if (payload.items?.length) {
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(toInvoiceItems(payload.items, invoice.id));

      if (itemsError) throw itemsError;
    }

    return mapInvoice(invoice);
  },

  // ✅ Update invoice (basic)
  async update(id, payload) {
    const { data, error } = await supabase
      .from('invoices')
      .update({
        ...toInvoice(payload),
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return mapInvoice(data);
  },

  // ✅ Replace items (simple approach)
  async replaceItems(invoiceId, items) {
    // delete old (soft delete optional)
    await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);

    // insert new
    const { error } = await supabase
      .from('invoice_items')
      .insert(toInvoiceItems(items, invoiceId));

    if (error) throw error;

    return true;
  },

  // ✅ Mark as paid
  async markAsPaid(id, paymentMode) {
    const { data, error } = await supabase
      .from('invoices')
      .update({
        status: 'PAID',
        payment_mode: paymentMode,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return mapInvoice(data);
  },

  // ✅ Soft delete
  async remove(id) {
    const { error } = await supabase
      .from('invoices')
      .update({ is_deleted: true })
      .eq('id', id);

    if (error) throw error;

    return true;
  },
};
