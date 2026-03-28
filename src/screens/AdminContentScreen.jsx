import { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { adminService } from '@/services/adminService';

// ─── Report Card ──────────────────────────────────────────────
const ReportCard = ({ item, onIgnore, onDelete }) => (
  <View
    className={`mx-4 mb-4 overflow-hidden rounded-xl border ${item.highlighted ? 'border-gray-900' : 'border-gray-200'}`}>
    {/* Reason header */}
    <View className="flex-row items-center justify-between border-b border-gray-100 px-3 py-2.5">
      <View className="flex-row items-center">
        <Text style={{ fontSize: 14, marginRight: 6 }}>{item.reasonIcon}</Text>
        <Text className="text-xs font-bold text-gray-700">NGUYÊN NHÂN: {item.reason}</Text>
      </View>
      <Text className="text-xs text-gray-400">{item.time}</Text>
    </View>

    {/* Post content */}
    <View className="px-3 pb-2 pt-3">
      {/* User */}
      <View className="mb-2 flex-row items-center">
        <View className="mr-2 h-9 w-9 items-center justify-center rounded-full bg-gray-200">
          <Text style={{ fontSize: 16 }}>👤</Text>
        </View>
        <Text className="text-sm font-semibold text-gray-900">{item.username}</Text>
      </View>

      {/* Caption */}
      <Text className="mb-3 text-sm text-gray-700">{item.caption}</Text>

      {/* Image placeholder */}
      {item.hasImage && (
        <View className="mb-3 h-28 items-center justify-center rounded-lg border border-gray-200 bg-gray-100">
          <Text style={{ fontSize: 28, color: '#d1d5db' }}>🖼️</Text>
        </View>
      )}
    </View>

    {/* Actions */}
    <View className="flex-row gap-2 px-3 pb-3">
      <TouchableOpacity
        onPress={() => onIgnore(item.id)}
        activeOpacity={0.8}
        className="flex-1 items-center rounded-lg border border-gray-300 py-3">
        <Text className="text-sm font-semibold text-gray-700">BỎ QUA</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onDelete(item.id)}
        activeOpacity={0.8}
        className="flex-1 flex-row items-center justify-center gap-1 rounded-lg bg-gray-900 py-3">
        <Text style={{ fontSize: 14 }}>🗑️</Text>
        <Text className="ml-1 text-sm font-bold text-white">XOÁ</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────
export default function AdminContentScreen() {
  const navigation = useNavigation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeReports = useCallback((payload) => {
    const items = payload?.content ?? payload?.items ?? payload ?? [];
    if (!Array.isArray(items)) return [];
    return items.map((r) => ({
      id: String(r?.id ?? ''),
      reason: r?.title ?? 'BÁO CÁO',
      reasonIcon: '⚠️',
      time: r?.createdAt ?? '',
      username: r?.username ?? 'unknown',
      caption: r?.content ?? '',
      hasImage: false,
      highlighted: false,
      raw: r,
    }));
  }, []);

  const loadReports = useCallback(async () => {
    const payload = await adminService.getAllReports(0, 50);
    setReports(normalizeReports(payload));
  }, [normalizeReports]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        await loadReports();
      } catch {
        if (mounted) setReports([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loadReports]);

  const handleIgnore = (id) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDelete = async (id) => {
    try {
      // Nếu backend có endpoint xoá report, dùng report id.
      await adminService.deleteReport(id);
      await loadReports();
    } catch (e) {
      Alert.alert('Thất bại', e.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* ── Header ── */}
      <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-2 p-1">
          <Text style={{ fontSize: 28, lineHeight: 30, color: '#111' }}>‹</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-gray-900">
          Bài viết bị tố cáo
        </Text>
        <View className="w-8" />
      </View>

      {/* ── List ── */}
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReportCard item={item} onIgnore={handleIgnore} onDelete={handleDelete} />
        )}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          loading ? (
            <View className="items-center py-6">
              <ActivityIndicator color="#000" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="items-center py-24">
            <Text style={{ fontSize: 40 }}>✅</Text>
            <Text className="mt-3 text-sm text-gray-400">Không có bài viết nào bị tố cáo</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
