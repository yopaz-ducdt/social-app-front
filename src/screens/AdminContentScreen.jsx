import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { adminService } from '@/services/adminService';

// ─── Warning Post Card ────────────────────────────────────────
const WarningPostCard = ({ item, onIgnore, onDelete }) => (
  <View
    className={`mx-4 mb-4 overflow-hidden rounded-xl border ${item.highlighted ? 'border-gray-900' : 'border-gray-200'}`}>
    {/* Warning header */}
    <View className="flex-row items-center justify-between border-b border-gray-100 px-3 py-2.5">
      <View className="flex-row items-center">
        <Text style={{ fontSize: 14, marginRight: 6 }}>{item.reasonIcon}</Text>
        <Text className="text-xs font-bold text-gray-700">NGUYÊN NHÂN: {item.reason}</Text>
      </View>
      <Text className="text-xs text-gray-400">{item.warningStatus}</Text>
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

      {item.title ? (
        <Text className="mb-1 text-sm font-semibold text-gray-900">{item.title}</Text>
      ) : null}
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

const ReportCard = ({ item, onIgnore, onDelete }) => (
  <View className="mx-4 mb-4 overflow-hidden rounded-xl border border-gray-200">
    <View className="flex-row items-center justify-between border-b border-gray-100 px-3 py-2.5">
      <View className="flex-row items-center">
        <Text style={{ fontSize: 14, marginRight: 6 }}>📄</Text>
        <Text className="text-xs font-bold text-gray-700">BÁO CÁO: {item.reason}</Text>
      </View>
      <Text className="text-xs text-gray-400">{item.time}</Text>
    </View>

    <View className="px-3 pb-2 pt-3">
      <Text className="mb-2 text-sm font-semibold text-gray-900">{item.title}</Text>
      <Text className="text-sm text-gray-700">{item.caption}</Text>
    </View>

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
        <Text className="ml-1 text-sm font-bold text-white">XOÁ BÁO CÁO</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────
export default function AdminContentScreen() {
  const navigation = useNavigation();
  const [warningPosts, setWarningPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeWarningPosts = useCallback((payload) => {
    const items = payload?.content ?? payload?.items ?? payload ?? [];
    if (!Array.isArray(items)) return [];
    return items.map((post) => ({
      id: String(post?.id ?? ''),
      reason: 'BÀI VIẾT BỊ CẢNH BÁO',
      reasonIcon: '⚠️',
      warningStatus: post?.warning ? 'CẢNH BÁO' : 'BÌNH THƯỜNG',
      username:
        [post?.userResponse?.firstName, post?.userResponse?.lastName].filter(Boolean).join(' ') ||
        'unknown',
      title: post?.title ?? '',
      caption: post?.content ?? '',
      hasImage: Array.isArray(post?.images) && post.images.length > 0,
      highlighted: Boolean(post?.warning),
      raw: post,
    }));
  }, []);

  const normalizeReports = useCallback((payload) => {
    const items = payload?.content ?? payload?.items ?? payload ?? [];
    if (!Array.isArray(items)) return [];
    return items.map((report) => ({
      id: String(report?.id ?? ''),
      reason: report?.title ?? 'BÁO CÁO',
      time: report?.createdAt ?? '',
      title: report?.title ?? 'Phiếu tố cáo',
      caption: report?.content ?? '',
      raw: report,
    }));
  }, []);

  const loadWarningPosts = useCallback(async () => {
    const payload = await adminService.getWarningPosts(0, 50);
    setWarningPosts(normalizeWarningPosts(payload));
  }, [normalizeWarningPosts]);

  const loadReports = useCallback(async () => {
    const payload = await adminService.getAllReports(0, 50);
    setReports(normalizeReports(payload));
  }, [normalizeReports]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        await Promise.all([loadWarningPosts(), loadReports()]);
      } catch {
        if (mounted) {
          setWarningPosts([]);
          setReports([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loadReports, loadWarningPosts]);

  const handleIgnore = (id) => {
    setWarningPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const handleIgnoreReport = (id) => {
    setReports((prev) => prev.filter((report) => report.id !== id));
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deletePost(id);
      await loadWarningPosts();
    } catch (e) {
      Alert.alert('Thất bại', e.message);
    }
  };

  const handleDeleteReport = async (id) => {
    try {
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
          Bài viết bị cảnh báo
        </Text>
        <View className="w-8" />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#000" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 16 }}>
          <View className="mb-2 px-4">
            <Text className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Bài viết bị cảnh báo
            </Text>
          </View>
          {warningPosts.length > 0 ? (
            <FlatList
              data={warningPosts}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <WarningPostCard item={item} onIgnore={handleIgnore} onDelete={handleDelete} />
              )}
            />
          ) : (
            <View className="items-center px-6 py-10">
              <Text className="text-sm text-gray-400">Không có bài viết nào bị cảnh báo</Text>
            </View>
          )}

          <View className="mb-2 mt-4 px-4">
            <Text className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Phiếu tố cáo
            </Text>
          </View>
          {reports.length > 0 ? (
            <FlatList
              data={reports}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <ReportCard
                  item={item}
                  onIgnore={handleIgnoreReport}
                  onDelete={handleDeleteReport}
                />
              )}
            />
          ) : (
            <View className="items-center px-6 py-10">
              <Text className="text-sm text-gray-400">Không có phiếu tố cáo nào</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
