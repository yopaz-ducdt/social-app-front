import { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PostOptionsModal from '@/components/PostOptionsModal';
import { userService } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

const IconHeart = ({ filled }) => <Text style={{ fontSize: 22 }}>{filled ? '❤️' : '🤍'}</Text>;
const IconMore = () => <Text style={{ fontWeight: '500', color: '#555' }}>•••</Text>;

const Avatar = ({ size = 9, uri = null }) => (
  <View
    className={`items-center justify-center overflow-hidden rounded-full bg-gray-200`}
    style={{ width: size * 4, height: size * 4 }}>
    {uri ? (
      <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
    ) : (
      <Text style={{ fontSize: size * 1.6 }}>👤</Text>
    )}
  </View>
);

export default function PostCard({ post, onDeleted }) {
  const navigation = useNavigation();
  const { user: currentUser } = useAuth();
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [showOptions, setShowOptions] = useState(false);
  const author = post?.author ?? {};
  const displayName =
    post?.username ||
    [author.firstName, author.lastName].filter(Boolean).join(' ').trim() ||
    author.username ||
    'unknown';
  const authorId = String(author.id ?? post?.raw?.userResponse?.id ?? post?.raw?.userId ?? '');
  const imageUrls = (Array.isArray(post?.images) ? post.images : []).map((item) => item?.url).filter(Boolean);
  const feedImages = imageUrls;
  const visibleImages = feedImages.slice(0, 3);
  const remainingImages = feedImages.length - visibleImages.length;
  const hasVisibleImages = visibleImages.length > 0;
  const isMyPost = Boolean(
    currentUser?.username === post.username ||
    currentUser?.username === author.username ||
    (authorId && String(currentUser?.id ?? currentUser?.userId ?? '') === authorId)
  );

  const toggleLike = async () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikes(nextLiked ? likes + 1 : likes - 1);
    try {
      await userService.likePost(post.id);
    } catch {
      setLiked(!nextLiked);
      setLikes(nextLiked ? likes - 1 : likes + 1);
    }
  };

  const openProfile = () => {
    if (!authorId) return;
    navigation.navigate('UserProfile', { userId: authorId });
  };

  const handleDelete = async (id) => {
    try {
      const response = await userService.deletePost(id);
      if (response?.code && response.code !== 200) {
        throw new Error(response?.message ?? 'Không thể xóa bài viết.');
      }
      setShowOptions(false);
      onDeleted?.(id);
      Alert.alert('Thành công', 'Đã xóa bài viết.');
    } catch (e) {
      Alert.alert('Thất bại', e.message);
    }
  };

  const handleReport = async (content) => {
    await userService.createReport(post.id, 'Báo cáo bài viết', content.trim());
  };

  return (
    <View className="mb-6">
      {/* Header */}
      <View className="mb-3 flex-row items-center px-4">
        <TouchableOpacity
          className="flex-1 flex-row items-center"
          activeOpacity={0.8}
          onPress={openProfile}>
          <Avatar
            size={9}
            uri={author.image?.url ?? author.avatarUrl ?? post?.image?.url ?? null}
          />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-semibold text-gray-900">{displayName}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity className="px-1" onPress={() => setShowOptions(true)}>
          <IconMore />
        </TouchableOpacity>
      </View>

      {hasVisibleImages && (
        <TouchableOpacity
          style={{ width, height: width }}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('PostDetail', { post })}
          className="items-center justify-center overflow-hidden border-b border-t border-gray-100 bg-gray-50">
          <View className="h-full w-full flex-row">
            {visibleImages.map((uri, index) => (
              <View
                key={`${post.id}-${uri}-${index}`}
                className={index < visibleImages.length - 1 ? 'border-r border-white' : ''}
                style={{ width: `${100 / visibleImages.length}%`, height: '100%' }}>
                <Image
                  source={{ uri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                {index === 2 && remainingImages > 0 && (
                  <View className="absolute inset-0 items-center justify-center bg-black/45">
                    <Text className="text-3xl font-bold text-white">+</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </TouchableOpacity>
      )}

      {/* Actions */}
      <View className="flex-row items-center px-4 pb-1 pt-3">
        <TouchableOpacity onPress={toggleLike} className="mr-4" activeOpacity={0.8}>
          <IconHeart filled={liked} />
        </TouchableOpacity>
        <View className="flex-1" />
      </View>

      {/* Likes */}
      <Text className="mb-1 px-4 text-sm font-semibold text-gray-900">
        {likes.toLocaleString()} like
      </Text>

      {/* Caption */}
      <View className="px-4">
        {post?.title ? <Text className="mb-1 text-sm font-semibold text-gray-900">{post.title}</Text> : null}
        {post?.content ? (
          <Text className="text-sm text-gray-900">
            <Text className="font-semibold">{displayName} </Text>
            {post.content}
          </Text>
        ) : null}
      </View>

      {/* Time */}
      <Text className="mt-1 px-4 text-xs text-gray-400">{post.time}</Text>
      <PostOptionsModal
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        post={post}
        isMyPost={isMyPost}
        onDelete={handleDelete}
        onReport={handleReport}
      />
    </View>
  );
}
