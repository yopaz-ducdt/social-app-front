import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTab from '@/components/BottomTab';
import PostCard from '@/components/PostCard';
import { userService } from '@/services/userService';
import { adaptPostList } from '@/utils/postAdapter';

const PAGE_SIZE = 10;

const IconBell = () => <Text style={{ fontSize: 22 }}>🔔</Text>;

export default function HomeScreen() {
  const navigation = useNavigation();

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);   // lần đầu
  const [loadingMore, setLoadingMore] = useState(false); // load thêm
  const [refreshing, setRefreshing] = useState(false);

  const isFetchingRef = useRef(false); // chặn double-fetch

  // ── Fetch một trang ─────────────────────────────────────
  const fetchPage = useCallback(async (pageNumber) => {
    const payload = await userService.getFeedPosts(pageNumber, PAGE_SIZE);
    const newPosts = adaptPostList(payload);
    return { newPosts, isLast: payload.last ?? newPosts.length < PAGE_SIZE };
  }, []);

  // ── Load lần đầu / refresh ───────────────────────────────
  const loadInitial = useCallback(async () => {
    try {
      const { newPosts, isLast } = await fetchPage(0);
      setPosts(newPosts);
      setPage(0);
      setHasMore(!isLast);
    } catch (err) {
      Alert.alert('Lỗi tải bảng tin', err.message);
      setPosts([]);
    }
  }, [fetchPage]);

  // ── Load thêm khi cuộn xuống ─────────────────────────────
  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) return;
    isFetchingRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const { newPosts, isLast } = await fetchPage(nextPage);
      setPosts((prev) => [...prev, ...newPosts]);
      setPage(nextPage);
      setHasMore(!isLast);
    } catch (err) {
      Alert.alert('Lỗi tải thêm', err.message);
    } finally {
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [fetchPage, hasMore, page]);

  // ── Mount ────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadInitial();
      setLoading(false);
    })();
  }, []);

  // ── Render ───────────────────────────────────────────────
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="items-center py-4">
        <ActivityIndicator color="#000" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View className="items-center py-16">
        <Text className="text-gray-400">Chưa có bài viết nào</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
        <View className="mr-2 h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
          <Text className="text-xs font-bold text-white">S</Text>
        </View>
        <Text className="flex-1 text-base font-bold text-gray-900">Social App</Text>
        <TouchableOpacity className="mr-3 p-1" onPress={() => navigation.navigate('Search')} activeOpacity={0.7}>
          <Text style={{ fontSize: 22 }}>🔍</Text>
        </TouchableOpacity>
        <TouchableOpacity className="p-1" onPress={() => navigation.navigate('Notification')} activeOpacity={0.7}>
          <IconBell />
        </TouchableOpacity>
      </View>

      {/* Feed */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <PostCard post={item} />}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await loadInitial();
                setRefreshing(false);
              }}
            />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-20 right-5 h-12 w-12 items-center justify-center rounded-full bg-black shadow-lg"
        onPress={() => navigation.navigate('CreatePost')}
        activeOpacity={0.85}>
        <Text className="text-2xl leading-none text-white">+</Text>
      </TouchableOpacity>

      <BottomTab />
    </SafeAreaView>
  );
}