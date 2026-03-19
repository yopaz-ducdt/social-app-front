import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// ─── Data ─────────────────────────────────────────────────────
const STATS = [
  { id: 'users', icon: '👥', value: '12.4k', label: 'Tổng users' },
  { id: 'reports', icon: 'ℹ️', value: '34', label: 'Phiếu tố cáo' },
];

const MODULES = [
  {
    id: 'users',
    icon: '👥',
    label: 'Quản lý người dùng',
    desc: 'Khoá/mở khoá người dùng',
    screen: 'AdminUsers',
  },
  {
    id: 'content',
    icon: '🚫',
    label: 'Kiểm duyệt nội dung',
    desc: 'Xem xét báo cáo, xoá bài viết vi phạm',
    screen: 'AdminContent',
  },
  {
    id: 'email',
    icon: '✉️',
    label: 'Nhật ký dịch vụ email',
    desc: 'Lịch sử email tự động của hệ thống',
    screen: 'AdminEmail',
  },
];

// ─── Bottom Tab Admin ─────────────────────────────────────────
const AdminBottomTab = ({ active, onPress }) => (
  <View className="flex-row border-t border-gray-100 bg-white px-6 pb-5 pt-3">
    <TouchableOpacity
      className="flex-1 items-center"
      onPress={() => onPress('dashboard')}
      activeOpacity={0.7}>
      <Text style={{ fontSize: 24 }}>⊞</Text>
      {active === 'dashboard' && <View className="mt-1 h-1 w-1 rounded-full bg-gray-900" />}
    </TouchableOpacity>
    <TouchableOpacity
      className="flex-1 items-center"
      onPress={() => onPress('settings')}
      activeOpacity={0.7}>
      <Text style={{ fontSize: 24 }}>⚙️</Text>
      {active === 'settings' && <View className="mt-1 h-1 w-1 rounded-full bg-gray-900" />}
    </TouchableOpacity>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────
export default function AdminDashboardScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* ── Header ── */}
      <View className="flex-row items-center px-4 py-3">
        <Text className="flex-1 text-lg font-bold text-gray-900">Bảng điều khiển Admin</Text>
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-full border border-gray-200"
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Settings')}>
          <Text style={{ fontSize: 18 }}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}>
        {/* ── Tổng quan ── */}
        <View className="mb-6 px-4">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Tổng Quan
          </Text>
          <View className="flex-row gap-3">
            {STATS.map((stat) => (
              <View key={stat.id} className="flex-1 rounded-xl border border-gray-200 p-4">
                <Text style={{ fontSize: 22, marginBottom: 8 }}>{stat.icon}</Text>
                <Text className="text-xl font-bold text-gray-900">{stat.value}</Text>
                <Text className="mt-1 text-xs text-gray-400">{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Management Modules ── */}
        <View className="px-4">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Management Modules
          </Text>
          <View className="overflow-hidden rounded-xl border border-gray-200">
            {MODULES.map((mod, index) => (
              <TouchableOpacity
                key={mod.id}
                onPress={() => navigation.navigate(mod.screen)}
                activeOpacity={0.7}
                className={`flex-row items-center bg-white px-4 py-4 ${
                  index < MODULES.length - 1 ? 'border-b border-gray-100' : ''
                }`}>
                {/* Icon */}
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                  <Text style={{ fontSize: 18 }}>{mod.icon}</Text>
                </View>

                {/* Text */}
                <View className="flex-1">
                  <Text className="mb-0.5 text-sm font-semibold text-gray-900">{mod.label}</Text>
                  <Text className="text-xs leading-4 text-gray-400">{mod.desc}</Text>
                </View>

                {/* Arrow */}
                <Text className="ml-2 text-lg text-gray-400">›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom Tab ── */}
      <AdminBottomTab active="dashboard" onPress={(key) => console.log(key)} />
    </SafeAreaView>
  );
}
