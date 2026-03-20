// screens/DevMenuScreen.jsx
import { Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREENS = [
  { name: 'Login', label: '🔐 Login' },
  { name: 'Signup', label: '📝 Đăng ký' },
  { name: 'ForgotPassword', label: '🔄 Quên mật khẩu' },
  { name: 'Home', label: '🏠 Home' },
  { name: 'Notification', label: '🔔 Thông báo' },
  { name: 'PostDetail', label: '📄 Chi tiết bài đăng' },
  { name: 'Settings', label: '⚙️ Cài đặt' },
  { name: 'Profile', label: 'Profile' },
  { name: 'EditProfile', label: 'EditProfile' },
  { name: 'AdminDashboard', label: 'AdminDashboard' },
  { name: 'EditPost', label: 'EditPost' },
  { name: 'AdminUsers', label: 'AdminUsers' },
  { name: 'AdminContent', label: 'AdminContent' },
];

export default function DevMenuScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Text className="py-4 text-center text-lg font-bold">🛠️ Dev Menu</Text>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        {SCREENS.map((s) => (
          <TouchableOpacity
            key={s.name}
            onPress={() => navigation.navigate(s.name)}
            className="rounded-xl border border-gray-200 px-4 py-4"
            activeOpacity={0.7}>
            <Text className="text-sm font-medium text-gray-800">{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
