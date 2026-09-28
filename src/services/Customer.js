// src/services/customerService.js
import { supabase } from '../lib/supabase';

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

// Supabase returns at most 1000 rows per request, so fetch in batches
const FETCH_BATCH_SIZE = 1000;

// Characters that break PostgREST `or()` filter syntax
const sanitizeSearch = text => text.replace(/[,()%*\\]/g, ' ').trim();

export const customerService = {
  async getAll() {
    const rows = [];
    for (let from = 0; ; from += FETCH_BATCH_SIZE) {
      const { data, error } = await supabase
        .from('customer')
        .select('*')
        .eq('is_deleted', false) // ✅ filter
        .order('name', { ascending: true })
        .order('id', { ascending: true })
        .range(from, from + FETCH_BATCH_SIZE - 1);

      if (error) throw error;

      rows.push(...data);
      if (data.length < FETCH_BATCH_SIZE) break;
    }

    return rows.map(mapCustomer);
  },

  // ✅ Get one page (server-side search)
  async getPaged({ page = 0, pageSize = 20, search = '' } = {}) {
    const searchText = sanitizeSearch(search || '');
    const from = page * pageSize;

    let query = supabase
      .from('customer')
      .select('*', { count: 'exact' })
      .eq('is_deleted', false);

    if (searchText) {
      query = query.or(
        `name.ilike.%${searchText}%,mobile.ilike.%${searchText}%,address.ilike.%${searchText}%`,
      );
    }

    const { data, error, count } = await query
      .order('name', { ascending: true })
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw error;

    return { rows: data.map(mapCustomer), total: count ?? 0 };
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
