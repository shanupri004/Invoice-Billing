// src/services/customerService.js
import { supabase } from '../lib/supabase';

console.log('SUPABASE CHECK:', supabase);

// 🔹 DB → App Model
const mapCustomer = row => ({
  id: row.id,
  name: row.name,
  address: row.address || '',
  mobile: row.mobile,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// 🔹 App → DB Model
const toCustomer = payload => ({
  name: payload.name,
  address: payload.address,
  mobile: payload.mobile,
});

export const customerService = {
  async getAll() {
    const { data, error } = await supabase
      .from('customer')
      .select('*')
      .eq('is_deleted', false); // ✅ filter

    if (error) throw error;

    return data.map(mapCustomer);
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('customer')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false) // ✅ safety
      .single();

    if (error) throw error;

    return mapCustomer(data);
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('customer')
      .insert([{ ...toCustomer(payload), is_deleted: false }])
      .select()
      .single();

    if (error) throw error;

    return mapCustomer(data);
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from('customer')
      .update({
        ...toCustomer(payload),
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return mapCustomer(data);
  },

  // ✅ soft delete
  async remove(id) {
    const { error } = await supabase
      .from('customer')
      .update({ is_deleted: true })
      .eq('id', id);

    if (error) throw error;

    return true;
  },
};
