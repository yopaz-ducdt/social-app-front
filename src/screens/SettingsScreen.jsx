import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// ─── Data ─────────────────────────────────────────────────────
const SETTINGS = [
  {
    section: 'QUẢN LÝ TÀI KHOẢN',
    items: [
      { id: 'profile', icon: '👤', label: 'Thông tin cá nhân', screen: 'EditProfile' },
      { id: 'password', icon: '🔒', label: 'Mật khẩu và Bảo mật', screen: 'ChangePassword' },
      { id: '2fa', icon: '🛡️', label: 'Xác nhận 2 bước', screen: 'TwoFactor' },
    ],
  },
  {
    section: 'QUYỀN RIÊNG TƯ VÀ BẢO AN TOÀN',
    items: [
      { id: 'visibility', icon: '👁️', label: 'Hiển thị hồ sơ', screen: 'ProfileVisibility' },
      { id: 'block', icon: '🚫', label: 'Chặn người dùng', screen: 'BlockedUsers' },
    ],
  },
  {
    section: 'ƯA THÍCH',
    items: [{ id: 'notif', icon: '🔔', label: 'Thông báo', screen: 'NotificationSetting' }],
  },
  {
    section: 'HỖ TRỢ',
    items: [
      { id: 'help', icon: '❓', label: 'Trung tâm hỗ trợ', url: 'https://support.example.com' },
      { id: 'legal', icon: 'ℹ️', label: 'Quyền và Thông tin pháp lý', screen: 'Legal' },
    ],
  },
];

// ─── Setting Item ──────────────────────────────────────────────
const SettingItem = ({ item, isLast }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (item.url) {
      Linking.openURL(item.url);
    } else if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  const isExternal = !!item.url;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`flex-row items-center bg-white px-4 py-4 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      {/* Icon */}
      <Text style={{ fontSize: 18, width: 28 }}>{item.icon}</Text>

      {/* Label */}
      <Text className="flex-1 text-sm text-gray-900">{item.label}</Text>

      {/* Arrow or external icon */}
      <Text className="text-sm text-gray-400">{isExternal ? '↗' : '›'}</Text>
    </TouchableOpacity>
  );
};

// ─── Section ──────────────────────────────────────────────────
const SettingSection = ({ section, items }) => (
  <View className="mb-5">
    <Text className="px-4 pb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
      {section}
    </Text>
    <View className="mx-4 overflow-hidden rounded-xl border border-gray-100">
      {items.map((item, index) => (
        <SettingItem key={item.id} item={item} isLast={index === items.length - 1} />
      ))}
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────
export default function SettingsScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  const filtered = SETTINGS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.label.toLowerCase().includes(search.toLowerCase())),
  })).filter((group) => group.items.length > 0);

  const handleLogout = () => {
    console.log('Đăng xuất');
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-100 bg-white px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
          <Text style={{ fontSize: 28, lineHeight: 30, color: '#111' }}>‹</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold text-gray-900">Cài đặt</Text>
        <View className="w-8" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Search */}
        <View className="px-4 py-4">
          <View className="flex-row items-center rounded-xl border border-gray-200 bg-white px-3 py-2.5">
            <Text className="mr-2 text-gray-400">🔍</Text>
            <TextInput
              className="flex-1 text-sm text-gray-900"
              placeholder="Tìm kiếm cài đặt"
              placeholderTextColor="#9ca3af"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text className="text-base text-gray-400">✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sections */}
        {filtered.map((group) => (
          <SettingSection key={group.section} section={group.section} items={group.items} />
        ))}

        {/* Logout */}
        <View className="mt-2 px-4">
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            className="flex-row items-center justify-center rounded-xl border border-red-400 py-4">
            <Text className="mr-2 text-red-500">↪</Text>
            <Text className="text-sm font-bold uppercase tracking-widest text-red-500">
              Đăng Xuất
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
