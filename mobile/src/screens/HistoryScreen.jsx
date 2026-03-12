import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { fetchHistory } from '../services/apiService';
import { colors } from '../theme/colors';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchHistory();
      setHistory(data);
    } catch (err) {
      console.error('[History] load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={history}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <HistoryItem item={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="mic-off-outline" size={52} color={colors.accentLight} />
            <Text style={styles.emptyText}>No commands recorded yet.</Text>
            <Text style={styles.emptySubText}>Use the Assistant tab to speak a command.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function HistoryItem({ item }) {
  const parsed = item.parsed || {};
  const resultColor =
    item.result === 'success' ? '#27ae60' :
    item.result === 'error'   ? '#e74c3c' :
    colors.textSecondary;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="mic-outline" size={15} color={colors.primary} />
        <Text style={styles.cardTime}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
        <View style={[styles.badge, { backgroundColor: resultColor + '22' }]}>
          <Text style={[styles.badgeText, { color: resultColor }]}>
            {item.result || 'unknown'}
          </Text>
        </View>
      </View>

      <Text style={styles.rawText}>"{item.raw_text}"</Text>

      {parsed.action && (
        <View style={styles.parsedBox}>
          {Object.entries(parsed).map(([k, v]) => (
            <View key={k} style={styles.parsedRow}>
              <Text style={styles.parsedKey}>{k}</Text>
              <Text style={styles.parsedValue}>{String(v)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { marginTop: 14, color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  emptySubText: { marginTop: 6, color: colors.textSecondary, fontSize: 13 },
  listContent: { padding: 16, gap: 12 },
  card: {
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardTime: { flex: 1, fontSize: 12, color: colors.textSecondary },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  rawText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 20,
  },
  parsedBox: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 8,
    gap: 3,
  },
  parsedRow: { flexDirection: 'row', gap: 8 },
  parsedKey: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
    minWidth: 72,
  },
  parsedValue: { fontSize: 12, color: colors.textPrimary, flex: 1 },
});
