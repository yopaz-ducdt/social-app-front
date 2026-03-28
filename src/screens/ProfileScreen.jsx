import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import BottomTab from '@/components/BottomTab';
import { userService } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 4) / 3;

// ─── Grid Item ────────────────────────────────────────────────
const GridItem = ({ item, onPress }) => (
  <TouchableOpacity
    style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
    className="items-center justify-center border border-white bg-gray-100"
    onPress={() => onPress(item)}
    activeOpacity={0.8}
  >
    {item?.images?.[0]?.url ? (
      <Image source={{ uri: item.images[0].url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
    ) : (
      <Text style={{ fontSize: 24, color: '#d1d5db' }}>🖼️</Text>
    )}
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────
export default function ProfileScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('grid')
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);

  const data = activeTab === 'grid' ? myPosts : [];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const p = await userService.getProfile();
        const postsPayload = await userService.getUserPosts(0, 30);
        const items = postsPayload?.content ?? postsPayload ?? [];
        if (!mounted) return;
        setProfile(p);
        setMyPosts(Array.isArray(items) ? items : []);
      } catch {
        if (!mounted) return;
        setProfile(null);
        setMyPosts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const viewModel = useMemo(() => {
    const username = user?.username ?? '';
    const fullName =
      [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || username;
    const description = profile?.description ?? profile?.bio ?? '';
    const avatarUrl = profile?.image?.url ?? null;
    return {
      username: username ? `@${username.replace(/^@/, '')}` : '@',
      fullName,
      description,
      avatarUrl,
      posts: Array.isArray(myPosts) ? myPosts.length : 0,
      followerCount: profile?.followerCount ?? 0,
      followingCount: profile?.followingCount ?? 0,
    };
  }, [profile, user, myPosts]);
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* ── Header ── */}
      <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
          <Text style={{ fontSize: 28, lineHeight: 30, color: '#111' }}>‹</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-semibold text-gray-900">
          {viewModel.username}
        </Text>
        <TouchableOpacity className="p-1">
          <Text style={{ fontSize: 16, color: '#555' }}>•••</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading && (
          <View className="items-center py-6">
            <ActivityIndicator color="#000" />
          </View>
        )}
        {/* ── Profile Info ── */}
        <View className="px-4 pb-2 pt-4">
          {/* Avatar + Name */}
          <View className="mb-4 flex-row items-center">
            <View className="mr-4 h-16 w-16 items-center justify-center rounded-full border border-dashed border-gray-400 overflow-hidden bg-gray-50">
              {viewModel.avatarUrl ? (
                <Image source={{ uri: viewModel.avatarUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : (
                <Text style={{ fontSize: 28 }}>👤</Text>
              )}
            </View>
            <View>
              <Text className="text-lg font-bold text-gray-900">{viewModel.fullName}</Text>
              <Text className="text-sm text-gray-400">{viewModel.description}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mb-5 flex-row gap-2">
            <TouchableOpacity
              className="flex-1 items-center rounded-xl bg-black py-3 justify-center"
              activeOpacity={0.85}
              onPress={() => navigation.navigate('EditProfile')}>
              <Text className="text-sm font-bold tracking-widest text-white">CHỈNH SỬA</Text>
            </TouchableOpacity>
            {user?.isAdmin && (
              <TouchableOpacity
                className="items-center justify-center rounded-xl border border-gray-200 px-4 py-3"
                activeOpacity={0.85}
                onPress={() => navigation.navigate('AdminDashboard')}>
                <Text style={{ fontSize: 16 }}>🛡️</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Stats */}
          <View className="mb-4 flex-row overflow-hidden rounded-xl border border-gray-100">
            {[
              { value: viewModel.posts, label: 'BÀI ĐĂNG' },
              { value: viewModel.followerCount, label: 'NGƯỜI THEO DÕI' },
              { value: viewModel.followingCount, label: 'ĐANG THEO DÕI' },
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
          keyExtractor={(item, idx) => String(item?.id ?? idx)}
          numColumns={3}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <GridItem
              item={item}
              onPress={(post) => navigation.navigate('PostDetail', { post })}
            />
          )}
        />
      </ScrollView>

      <BottomTab activeTab="profile" onTabPress={(key) => navigation.navigate(key)} />
    </SafeAreaView>
  );
}
