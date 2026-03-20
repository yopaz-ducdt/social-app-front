import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// ─── Fake Data ────────────────────────────────────────────────
const USERS = [
  { id: '1', username: 'phuc_nh', email: 'phucnh@gmail.com', status: 'active' },
  { id: '2', username: 'linh_nk', email: 'nk@gmail.com', status: 'blocked' },
  { id: '3', username: 'nam_nd', email: 'nam.nd@gmail.com', status: 'active' },
  { id: '4', username: 'manh_nd', email: 'manh@gmail.com', status: 'active' },
  { id: '5', username: 'duc_dd', email: 'duc@gmail.com', status: 'blocked' },
];

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Hoạt động' },
  { key: 'blocked', label: 'Khoá' },
];

// ─── User Item ────────────────────────────────────────────────
const UserItem = ({ user, onToggle }) => {
  const isBlocked = user.status === 'blocked';

  return (
    <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
      {/* Avatar */}
      <View
        className={`mr-3 h-11 w-11 items-center justify-center rounded-full ${isBlocked ? 'bg-gray-200' : 'bg-gray-100'}`}>
        <Text style={{ fontSize: 20, opacity: isBlocked ? 0.4 : 1 }}>👤</Text>
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className={`text-sm font-semibold ${isBlocked ? 'text-gray-400' : 'text-gray-900'}`}>
          {user.username}
        </Text>
        <Text className="mb-1 text-xs text-gray-400">{user.email}</Text>
        <View className="flex-row items-center">
          <View
            className={`mr-1 h-1.5 w-1.5 rounded-full ${isBlocked ? 'bg-gray-400' : 'bg-gray-900'}`}
          />
          <Text className={`text-xs font-medium ${isBlocked ? 'text-gray-400' : 'text-gray-900'}`}>
            {isBlocked ? 'KHOÁ' : 'HOẠT ĐỘNG'}
          </Text>
        </View>
      </View>

      {/* Lock/Unlock button */}
      <TouchableOpacity
        onPress={() => onToggle(user.id)}
        activeOpacity={0.8}
        className={`h-10 w-10 items-center justify-center rounded-full border-2 ${
          isBlocked ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
        }`}>
        <Text style={{ fontSize: 16 }}>{isBlocked ? '🔒' : '🔓'}</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────
export default function AdminUsersScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [users, setUsers] = useState(USERS);

  const handleToggle = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u
      )
    );
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      activeTab === 'all' ||
      (activeTab === 'active' && u.status === 'active') ||
      (activeTab === 'blocked' && u.status === 'blocked');
    return matchSearch && matchTab;
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* ── Header ── */}
      <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-2 p-1">
          <Text style={{ fontSize: 28, lineHeight: 30, color: '#111' }}>‹</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-gray-900">
          Quản lý người dùng
        </Text>
        <View className="w-8" />
      </View>

      {/* ── Search ── */}
      <View className="px-4 py-3">
        <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
          <Text className="mr-2 text-gray-400">🔍</Text>
          <TextInput
            className="flex-1 text-sm text-gray-900"
            placeholder="Tìm bằng tên hoặc email ..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text className="text-gray-400">✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filter Tabs ── */}
      <View className="mb-2 flex-row gap-2 px-4">
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
            className={`rounded-full border px-4 py-1.5 ${
              activeTab === tab.key ? 'border-gray-900 bg-gray-900' : 'border-gray-200 bg-white'
            }`}>
            <Text
              className={`text-xs font-semibold ${
                activeTab === tab.key ? 'text-white' : 'text-gray-600'
              }`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── User List ── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <UserItem user={item} onToggle={handleToggle} />}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-sm text-gray-400">Không tìm thấy người dùng</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
