import { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PostOptionsModal from '@/components/PostOptionsModal';
import { userService } from '@/services/userService';

const { width } = Dimensions.get('window');

const IconHeart = ({ filled }) => <Text style={{ fontSize: 22 }}>{filled ? '❤️' : '🤍'}</Text>;
const IconComment = () => <Text style={{ fontSize: 22 }}>💬</Text>;
const IconShare = () => <Text style={{ fontSize: 22 }}>➤</Text>;
const IconMore = () => <Text style={{ fontWeight: '500', color: '#555' }}>•••</Text>;

export default function PostCard({ post }) {
  const navigation = useNavigation();
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [showOptions, setShowOptions] = useState(false);

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
        <View className="mr-3 h-9 w-9 rounded-full bg-gray-300" />
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-900">{post.username}</Text>
          <Text className="text-xs text-gray-400">{post.location}</Text>
        </View>
        <TouchableOpacity className="px-1" onPress={() => setShowOptions(true)}>
          <IconMore />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Image placeholder */}
      <View style={{ width, height: width }} className="items-center justify-center bg-gray-100">
        <View className="h-16 w-16 items-center justify-center rounded-xl border border-gray-300">
          <Text className="text-3xl text-gray-300">🖼️</Text>
        </View>
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
