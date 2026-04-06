import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import {
  ChevronLeft,
  Search,
  UserPlus,
  User,
  Phone,
  MapPin,
  Pencil,
  Trash2,
  X,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants/Colors';
import ConfirmModal from '../components/ConfirmModal';
import { customerService } from '../services/Customer';

// ─────────────────────────────────────────────────────────────────────────────

export default function CustomerListScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // customer to delete

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        c.address.toLowerCase().includes(q),
    );
  }, [query, customers]);

  const fetchCustomers = async () => {
    try {
      const data = await customerService.getAll();
      console.log('Fetched customers:', data);
      setCustomers(data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCustomers();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCustomers();
    setRefreshing(false);
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleEdit = customer => {
    navigation.navigate('CreateCustomer', { customer });
  };

  const confirmDelete = customer => {
    setDeleteTarget(customer);
  };

  const handleDelete = async () => {
    try {
      await customerService.remove(deleteTarget.id);
      fetchCustomers(); // refresh after delete
      setDeleteTarget(null);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  // ── Avatar initials ────────────────────────────────────────────────────────
  const getInitials = name => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // ── List item ──────────────────────────────────────────────────────────────
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.customerName} numberOfLines={1}>
          {item.name}
        </Text>

        {item.mobile ? (
          <View style={styles.metaRow}>
            <Phone size={13} color={COLORS.secondary} />
            <Text style={styles.metaText}>{item.mobile}</Text>
          </View>
        ) : null}

        <View style={styles.metaRow}>
          <MapPin size={13} color={COLORS.secondary} />
          <Text style={styles.metaText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => handleEdit(item)}
          hitSlop={6}
          activeOpacity={0.75}
        >
          <Pencil size={20} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => confirmDelete(item)}
          hitSlop={6}
          activeOpacity={0.75}
        >
          <Trash2 size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Empty state ────────────────────────────────────────────────────────────
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <User size={52} color="#d1d5db" />
      <Text style={styles.emptyTitle}>
        {query ? 'No results found' : 'No customers yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {query
          ? `Nothing matched "${query}"`
          : 'Tap + to add your first customer'}
      </Text>
    </View>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Dashboard')}
            hitSlop={8}
          >
            <ChevronLeft size={30} color="#111" />
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.title}>Customers</Text>
            <Text style={styles.subtitle}>
              {customers.length} {customers.length <= 1 ? 'record' : 'records'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateCustomer')}
            activeOpacity={0.85}
          >
            <UserPlus size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#9ca3af" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Search by name, mobile or address"
            placeholderTextColor="#aaa"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <X size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* Count badge when filtering */}
        {query.length > 0 && (
          <Text style={styles.resultCount}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "
            {query}"
          </Text>
        )}

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            filtered.length === 0 && { flex: 1 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshing={refreshing} // ✅ ADD
          onRefresh={onRefresh} // ✅ ADD
        />
      </View>

      {/* Delete confirmation modal */}
      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Customer?"
        message={`"${deleteTarget?.name}" will be permanently removed. This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        danger={true}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#111',
  },

  subtitle: {
    color: COLORS.secondary,
    fontSize: 15,
  },

  addButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  // ── Search ────────────────────────────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    marginBottom: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    color: '#111',
  },

  resultCount: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 10,
    marginLeft: 4,
  },

  // ── List ──────────────────────────────────────────────────────────────────
  listContent: {
    paddingBottom: 30,
    paddingTop: 4,
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primary + '1A', // 10% opacity
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },

  info: {
    flex: 1,
    gap: 3,
  },

  customerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 2,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  metaText: {
    fontSize: 16,
    color: COLORS.secondary,
    flexShrink: 1,
  },

  // ── Action buttons ────────────────────────────────────────────────────────
  actions: {
    gap: 8,
    marginLeft: 10,
  },

  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  editBtn: {
    backgroundColor: COLORS.primary + '15',
  },

  deleteBtn: {
    backgroundColor: '#fef2f2',
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
    gap: 8,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 12,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
