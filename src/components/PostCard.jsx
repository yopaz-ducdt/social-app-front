import { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PostOptionsModal from '@/components/PostOptionsModal';
import { userService } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

const IconHeart = ({ filled }) => <Text style={{ fontSize: 22 }}>{filled ? '❤️' : '🤍'}</Text>;
const IconComment = () => <Text style={{ fontSize: 22 }}>💬</Text>;
const IconShare = () => <Text style={{ fontSize: 22 }}>➤</Text>;
const IconMore = () => <Text style={{ fontWeight: '500', color: '#555' }}>•••</Text>;

const Avatar = ({ size = 9, uri = null }) => (
  <View
    className={`items-center justify-center rounded-full bg-gray-200 overflow-hidden`}
    style={{ width: size * 4, height: size * 4 }}>
    {uri ? (
      <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
    ) : (
      <Text style={{ fontSize: size * 1.6 }}>👤</Text>
    )}
  </View>
);

export default function PostCard({ post }) {
  const navigation = useNavigation();
  const { user: currentUser } = useAuth();
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [showOptions, setShowOptions] = useState(false);

  // Check if current user is the author
  // BE structure mapping: post.username, post.author.id, etc.
  const isMyPost = Boolean(
    currentUser?.username === post.username ||
    (post.author?.id && (currentUser?.id === post.author.id || currentUser?.userId === post.author.id))
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

  return (
    <View className="mb-6">
      {/* Header — nhấn để vào PostDetail */}
      <TouchableOpacity
        className="mb-3 flex-row items-center px-4"
        activeOpacity={0.8}
        onPress={() => navigation.navigate('PostDetail', { post })}>
        <Avatar size={9} uri={post?.author?.image?.url ?? post?.image?.url} />
        <View className="ml-3 flex-1">
          <Text className="text-sm font-semibold text-gray-900">{post.username}</Text>
          <Text className="text-xs text-gray-400">@{post.username}</Text>
        </View>
        {isMyPost && (
          <TouchableOpacity className="px-1" onPress={() => setShowOptions(true)}>
            <IconMore />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Post Image */}
      <View
        style={{ width, height: width }}
        className="items-center justify-center border-b border-t border-gray-100 bg-gray-50 overflow-hidden">
        {post?.images?.[0]?.url ? (
          <Image
            source={{ uri: post.images[0].url }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : post?.image?.url ? (
          <Image
            source={{ uri: post.image.url }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View className="h-16 w-16 items-center justify-center rounded-xl border border-gray-300">
            <Text className="text-3xl text-gray-300">🖼️</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View className="flex-row items-center px-4 pb-1 pt-3">
        <TouchableOpacity onPress={toggleLike} className="mr-4" activeOpacity={0.8}>
          <IconHeart filled={liked} />
        </TouchableOpacity>
        <TouchableOpacity className="mr-4" activeOpacity={0.8}>
          <IconComment />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8}>
          <IconShare />
        </TouchableOpacity>
        <View className="flex-1" />
      </View>

      {/* Likes */}
      <Text className="mb-1 px-4 text-sm font-semibold text-gray-900">
        {likes.toLocaleString()} like
      </Text>

      {/* Caption */}
      <View className="px-4">
        <Text className="text-sm text-gray-900">
          <Text className="font-semibold">{post.username || post.title} </Text>
          {post.content}
        </Text>
      </View>

      {/* Time */}
      <Text className="mt-1 px-4 text-xs text-gray-400">{post.time}</Text>
      <PostOptionsModal
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        post={post}
        onDelete={async (id) => {
          try {
            await userService.deletePost(id);
          } catch (e) {
            console.warn('Xoá bài thất bại:', e.message);
          }
        }}
      />
    </View>
  );
}
