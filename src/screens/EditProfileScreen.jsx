import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function EditProfileScreen() {
  const navigation = useNavigation();

  const [displayName, setDisplayName] = useState('TDuc');
  const [username, setUsername] = useState('ducdt');
  const [bio, setBio] = useState('xin chao to la duc theo doi to nhe');

  const handleSave = () => {
    console.log('Lưu hồ sơ:', { displayName, username, bio });
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* ── Header ── */}
        <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-16">
            <Text className="text-sm text-gray-600">Quay lại</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-center text-base font-bold text-gray-900">Hồ sơ</Text>
          <TouchableOpacity onPress={handleSave} className="w-16 items-end">
            <Text className="text-sm font-semibold text-blue-500">Xác nhận</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 px-6 pb-10 pt-8">
            {/* ── Avatar ── */}
            <View className="mb-8 items-center">
              <View className="relative">
                <View className="h-24 w-24 items-center justify-center rounded-full border border-dashed border-gray-300">
                  <Text style={{ fontSize: 40, color: '#d1d5db' }}>👤</Text>
                </View>
                {/* Camera button */}
                <TouchableOpacity
                  className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-900"
                  activeOpacity={0.8}>
                  <Text style={{ fontSize: 14 }}>📷</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity className="mt-3">
                <Text className="text-sm font-medium text-blue-500">Chỉnh ảnh hồ sơ</Text>
              </TouchableOpacity>
            </View>

            {/* ── Tên hiển thị ── */}
            <View className="mb-5">
              <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                Tên Hiển Thị
              </Text>
              <TextInput
                className="rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Tên hiển thị"
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* ── Username ── */}
            <View className="mb-5">
              <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                Username
              </Text>
              <View className="flex-row items-center rounded-lg border border-gray-300 px-4 py-3">
                <Text className="mr-1 text-base text-gray-400">@</Text>
                <TextInput
                  className="flex-1 text-base text-gray-900"
                  value={username}
                  onChangeText={setUsername}
                  placeholder="username"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* ── Giới thiệu ── */}
            <View className="mb-10">
              <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                Giới Thiệu
              </Text>
              <TextInput
                className="rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900"
                value={bio}
                onChangeText={setBio}
                placeholder="Giới thiệu về bạn..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{ minHeight: 100 }}
              />
            </View>

            {/* ── Save Button ── */}
            <TouchableOpacity
              className="items-center rounded-xl bg-black py-4"
              onPress={handleSave}
              activeOpacity={0.85}>
              <Text className="text-base font-bold text-white">Lưu thay đổi</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
