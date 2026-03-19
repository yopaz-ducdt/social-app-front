import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import BottomTab from '@/components/BottomTab';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 4) / 3;

// ─── Fake Data ────────────────────────────────────────────────
const USER = {
  username: '@ducdt',
  fullName: 'TDuc',
  description: 'xin chao to la duc theo doi to nhe',
  posts: 128,
  followers: '12.5k',
  following: 840,
};

const GRID_POSTS = Array.from({ length: 9 }, (_, i) => ({ id: String(i) }));
const TAGGED_POSTS = Array.from({ length: 6 }, (_, i) => ({ id: String(i) }));

// ─── Grid Item ────────────────────────────────────────────────
const GridItem = ({ item }) => (
  <View
    style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
    className="items-center justify-center border border-white bg-gray-100">
    <Text style={{ fontSize: 24, color: '#d1d5db' }}>🖼️</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────
export default function ProfileScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'tagged'

  const data = activeTab === 'grid' ? GRID_POSTS : TAGGED_POSTS;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* ── Header ── */}
      <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
          <Text style={{ fontSize: 28, lineHeight: 30, color: '#111' }}>‹</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-semibold text-gray-900">
          {USER.username}
        </Text>
        <TouchableOpacity className="p-1">
          <Text style={{ fontSize: 16, color: '#555' }}>•••</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Profile Info ── */}
        <View className="px-4 pb-2 pt-4">
          {/* Avatar + Name */}
          <View className="mb-4 flex-row items-center">
            <View className="mr-4 h-16 w-16 items-center justify-center rounded-full border border-dashed border-gray-400">
              <Text style={{ fontSize: 28 }}>👤</Text>
            </View>
            <View>
              <Text className="text-lg font-bold text-gray-900">{USER.fullName}</Text>
              <Text className="text-sm text-gray-400">{USER.description}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mb-5 flex-row gap-2">
            <TouchableOpacity
              className="flex-1 items-center rounded-xl bg-black py-3"
              activeOpacity={0.85}
              onPress={() => navigation.navigate('EditProfile')}>
              <Text className="text-sm font-bold tracking-widest text-white">CHỈNH SỬA</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="h-12 w-12 items-center justify-center rounded-xl border border-gray-200"
              activeOpacity={0.8}>
              <Text style={{ fontSize: 18 }}>↗</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View className="mb-4 flex-row overflow-hidden rounded-xl border border-gray-100">
            {[
              { value: USER.posts, label: 'BÀI ĐĂNG' },
              { value: USER.followers, label: 'THEO DÕI' },
              { value: USER.following, label: 'ĐANG THEO DÕI' },
            ].map((stat, index) => (
              <View
                key={stat.label}
                className={`flex-1 items-center py-3 ${index < 2 ? 'border-r border-gray-100' : ''}`}>
                <Text className="text-base font-bold text-gray-900">{stat.value}</Text>
                <Text className="mt-0.5 text-xs text-gray-400">{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Tabs ── */}
        <View className="flex-row border-b border-gray-100">
          <TouchableOpacity
            className={`flex-1 items-center border-b-2 py-3 ${activeTab === 'grid' ? 'border-gray-900' : 'border-transparent'}`}
            onPress={() => setActiveTab('grid')}>
            <Text style={{ fontSize: 22 }}>⊞</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center border-b-2 py-3 ${activeTab === 'tagged' ? 'border-gray-900' : 'border-transparent'}`}
            onPress={() => setActiveTab('tagged')}>
            <Text style={{ fontSize: 22 }}>🖼️</Text>
          </TouchableOpacity>
        </View>

        {/* ── Grid ── */}
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          numColumns={3}
          scrollEnabled={false}
          renderItem={({ item }) => <GridItem item={item} />}
        />
      </ScrollView>

      <BottomTab activeTab="profile" onTabPress={(key) => navigation.navigate(key)} />
    </SafeAreaView>
  );
}
