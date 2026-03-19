import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// ─── Fake selected images ─────────────────────────────────────
const INITIAL_IMAGES = [{ id: '1' }, { id: '2' }];

// ─── Extra options ────────────────────────────────────────────
const OPTIONS = [
  { id: 'tag', icon: '👥', label: 'Gắn thẻ người khác' },
  { id: 'feeling', icon: '😊', label: 'Cảm xúc / Hoạt động' },
  { id: 'location', icon: '📍', label: 'Thêm vị trí' },
];

export default function CreatePostScreen() {
  const navigation = useNavigation();
  const [caption, setCaption] = useState('');
  const [images, setImages] = useState(INITIAL_IMAGES);

  const handleRemoveImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleAddImage = () => {
    // Tích hợp image picker ở đây
    console.log('Mở thư viện ảnh');
  };

  const handlePost = () => {
    console.log('Đăng bài:', { caption, images });
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* ── Header ── */}
        <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-12">
            <Text className="text-sm text-gray-600">Huỷ</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-center text-base font-bold text-gray-900">Tạo bài viết</Text>
          <TouchableOpacity
            onPress={handlePost}
            disabled={!caption.trim() && images.length === 0}
            className={`rounded-lg px-4 py-1.5 ${caption.trim() || images.length > 0 ? 'bg-black' : 'bg-gray-300'}`}
            activeOpacity={0.85}>
            <Text className="text-sm font-bold tracking-widest text-white">ĐĂNG</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* ── User info ── */}
          <View className="flex-row items-center px-4 py-4">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-200">
              <Text style={{ fontSize: 20 }}>👤</Text>
            </View>
            <Text className="text-sm font-semibold text-gray-900">Phuc_nh</Text>
          </View>

          {/* ── Caption input ── */}
          <TextInput
            className="min-h-20 px-4 text-base text-gray-900"
            placeholder="Bạn đang nghĩ gì thế?"
            placeholderTextColor="#9ca3af"
            value={caption}
            onChangeText={setCaption}
            multiline
            textAlignVertical="top"
          />

          {/* ── Image picker row ── */}
          <View className="mb-6 mt-4 px-4">
            <FlatList
              data={[...images, { id: 'add' }]}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
              renderItem={({ item }) => {
                if (item.id === 'add') {
                  return (
                    <TouchableOpacity
                      onPress={handleAddImage}
                      activeOpacity={0.8}
                      className="h-24 w-24 items-center justify-center rounded-xl border border-gray-200">
                      <Text style={{ fontSize: 20 }}>🖼️</Text>
                      <Text className="mt-1 text-xs text-gray-400">Thêm</Text>
                    </TouchableOpacity>
                  );
                }
                return (
                  <View className="relative">
                    <View className="h-24 w-24 items-center justify-center rounded-xl border border-gray-200 bg-gray-100">
                      <Text style={{ fontSize: 24, color: '#d1d5db' }}>🖼️</Text>
                    </View>
                    {/* Remove button */}
                    <TouchableOpacity
                      onPress={() => handleRemoveImage(item.id)}
                      className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full bg-gray-800"
                      activeOpacity={0.8}>
                      <Text style={{ fontSize: 12, color: 'white', lineHeight: 14 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          </View>

          {/* ── Divider ── */}
          <View className="mx-4 mb-2 h-px bg-gray-100" />

          {/* ── Options ── */}
          {OPTIONS.map((opt, index) => (
            <TouchableOpacity
              key={opt.id}
              activeOpacity={0.7}
              className={`flex-row items-center px-4 py-4 ${index < OPTIONS.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <Text style={{ fontSize: 20, width: 32 }}>{opt.icon}</Text>
              <Text className="flex-1 text-sm text-gray-800">{opt.label}</Text>
              <Text className="text-lg text-gray-400">›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
