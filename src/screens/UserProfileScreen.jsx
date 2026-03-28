import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Dimensions,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { userService } from '@/services/userService';
import BottomTab from '@/components/BottomTab';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 4) / 3;

// ─── Grid Item ────────────────────────────────────────────────
const GridItem = ({ post, onPress }) => (
    <TouchableOpacity
        style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
        className="bg-gray-100 items-center justify-center border border-white"
        onPress={() => onPress(post)}
        activeOpacity={0.8}
    >
        {post.images?.[0]?.url ? (
            <Image source={{ uri: post.images[0].url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
            <Text style={{ fontSize: 24, color: '#d1d5db' }}>🖼️</Text>
        )}
    </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────
export default function UserProfileScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { user: currentUser } = useAuth();
    const { userId } = route.params;

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isFollowing, setFollowing] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingFollow, setLoadingFollow] = useState(false);
    const [activeTab, setActiveTab] = useState('grid');

    // ── Fetch profile + posts ─────────────────────────────────
    const fetchData = useCallback(async () => {
        try {
            setLoadingProfile(true);

            // Lấy profile và posts của user
            const [profileRes, postsRes] = await Promise.all([
                userService.getUserById(userId),
                userService.getUserPostsById(userId),
            ]);

            setProfile(profileRes);
            
            const isFollower = Array.isArray(profileRes?.followers)
              ? profileRes.followers.some(f => 
                  f === currentUser?.id || 
                  f?.id === currentUser?.id || 
                  f?.userId === currentUser?.id
                )
              : false;

            setFollowing(Boolean(profileRes?.isFollowing ?? profileRes?.following ?? profileRes?.likeStatus ?? isFollower));
            setPosts(postsRes?.content ?? postsRes?.items ?? postsRes ?? []);
        } catch (e) {
            Alert.alert('Lỗi', e.message);
        } finally {
            setLoadingProfile(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── Follow / Unfollow ─────────────────────────────────────
    const handleFollow = async () => {
        try {
            setLoadingFollow(true);
            await userService.follow(userId);
            setFollowing((prev) => !prev);
        } catch (e) {
            Alert.alert('Lỗi', e.message);
        } finally {
            setLoadingFollow(false);
        }
    };

    if (loadingProfile) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#000" />
            </SafeAreaView>
        );
    }

    const fullName = profile
        ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim().toUpperCase()
        : userId;

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* ── Header ── */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
                    <Text style={{ fontSize: 28, lineHeight: 30, color: '#111' }}>‹</Text>
                </TouchableOpacity>
                <Text className="flex-1 -ml-6 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">
                    {fullName ?? userId}
                </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="items-center px-6 pt-6 pb-4">
                    {/* Avatar */}
                    <View className="w-24 h-24 rounded-full border border-dashed border-gray-300 items-center justify-center mb-4 overflow-hidden bg-gray-50">
                        {profile?.image?.url ? (
                            <Image source={{ uri: profile.image.url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        ) : (
                            <Text style={{ fontSize: 40, color: '#d1d5db' }}>👤</Text>
                        )}
                    </View>

                    {/* Tên */}
                    <Text className="text-xl font-bold text-gray-900 tracking-wide mb-1">
                        {fullName || '—'}
                    </Text>

                    {/* Username */}
                    {profile?.username && (
                        <Text className="text-sm text-gray-400 mb-2">@{profile.username}</Text>
                    )}

                    {/* Bio (nếu BE có) */}
                    {profile?.bio && (
                        <Text className="text-sm text-gray-600 text-center mb-4">{profile.bio}</Text>
                    )}

                    {/* Action buttons */}
                    <View className="flex-row gap-3 w-full mt-3 mb-6">
                        <TouchableOpacity
                            onPress={handleFollow}
                            disabled={loadingFollow}
                            activeOpacity={0.85}
                            className={`flex-1 py-3 rounded-xl items-center border ${isFollowing ? 'bg-white border-gray-300' : 'bg-black border-black'
                                }`}
                        >
                            {loadingFollow ? (
                                <ActivityIndicator size="small" color={isFollowing ? '#000' : '#fff'} />
                            ) : (
                                <Text
                                    className={`text-sm font-bold tracking-widest uppercase ${isFollowing ? 'text-gray-700' : 'text-white'
                                        }`}
                                >
                                    {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 py-3 rounded-xl items-center border border-gray-300"
                            activeOpacity={0.85}
                        >
                            <Text className="text-sm font-bold text-gray-700 tracking-widest uppercase">
                                Nhắn tin
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Stats */}
                    <View className="flex-row w-full border border-gray-100 rounded-xl overflow-hidden mb-4">
                        {[
                            { value: posts.length, label: 'BÀI ĐĂNG' },
                            { value: profile?.followerCount ?? 0, label: 'NGƯỜI THEO DÕI' },
                            { value: profile?.followingCount ?? 0, label: 'ĐANG THEO DÕI' },
                        ].map((stat, index) => (
                            <View
                                key={stat.label}
                                className={`flex-1 items-center py-3 ${index < 2 ? 'border-r border-gray-100' : ''}`}
                            >
                                <Text className="text-base font-bold text-gray-900">{stat.value}</Text>
                                <Text className="text-xs text-gray-400 mt-0.5">{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ── Tabs ── */}
                <View className="flex-row border-b border-gray-100">
                    {[
                        { key: 'grid', icon: '⊞' },
                        { key: 'reels', icon: '🎬' },
                        { key: 'tagged', icon: '🖼️' },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            className={`flex-1 items-center py-3 border-b-2 ${activeTab === tab.key ? 'border-gray-900' : 'border-transparent'
                                }`}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <Text style={{ fontSize: 20 }}>{tab.icon}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── Grid posts ── */}
                {posts.length === 0 ? (
                    <View className="items-center py-16">
                        <Text className="text-gray-400 text-sm">Chưa có bài đăng nào</Text>
                    </View>
                ) : (
                    <FlatList
                        data={posts}
                        keyExtractor={(item) => item.id}
                        numColumns={3}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                            <GridItem
                                post={item}
                                onPress={(post) => navigation.navigate('PostDetail', { post })}
                            />
                        )}
                    />
                )}
            </ScrollView>

            <BottomTab activeTab="home" onTabPress={(key) => navigation.navigate(key)} />
        </SafeAreaView>
    );
}