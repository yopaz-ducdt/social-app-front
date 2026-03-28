import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { userService } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';
import PostOptionsModal from '@/components/PostOptionsModal';

const { width } = Dimensions.get('window');

const getNested = (obj, path) => {
  try {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  } catch {
    return undefined;
  }
};

// Normalize response shape theo PostResponse schema API
const adaptPostDetail = (raw) => {
  return {
    id: String(raw?.id ?? ''),
    title: raw?.title ?? '',
    content: raw?.content ?? '',
    likes: Number(raw?.like ?? 0) || 0,
    images: raw?.images ?? [],
    commentCount: raw?.commentResponseList?.length ?? 0,
    author: {
      username: raw?.username ?? raw?.author?.username ?? '',
      id: raw?.authorId ?? raw?.userId ?? null,
    },
    isFollowing: Boolean(raw?.isFollowing ?? false),
    liked: Boolean(raw?.liked ?? raw?.isLiked ?? false),
    comments: raw?.commentResponseList ?? [],
    raw,
  };
};

const adaptComments = (rawComments) => {
  const arr = Array.isArray(rawComments) ? rawComments : [];
  return arr.map((c) => ({
    id: String(c?.id ?? Math.random()),
    username: c?.fullName ?? c?.username ?? 'unknown',
    userId: c?.userId ?? '',
    text: c?.content ?? '',
    url: c?.url ?? '',
    likes: 0,
    liked: false,
    replies: [],
    raw: c,
  }));
};

// ─── Icons ───────────────────────────────────────────────────
const IconHeart = ({ filled, size = 22 }) => (
  <Text style={{ fontSize: size }}>{filled ? '❤️' : '🤍'}</Text>
);
const IconComment = () => <Text style={{ fontSize: 22 }}>💬</Text>;
const IconShare = () => <Text style={{ fontSize: 22 }}>➤</Text>;
const IconMore = () => <Text style={{ fontWeight: '500', color: '#555' }}>•••</Text>;

// ─── Avatar placeholder ───────────────────────────────────────
const Avatar = ({ size = 10 }) => (
  <View
    className={`items-center justify-center rounded-full bg-gray-200`}
    style={{ width: size * 4, height: size * 4 }}>
    <Text style={{ fontSize: size * 1.6 }}>👤</Text>
  </View>
);

// ─── Comment Item ─────────────────────────────────────────────
const CommentItem = ({ comment, isReply = false }) => {
  const [liked, setLiked] = useState(comment.liked);
  const [likes, setLikes] = useState(comment.likes);

  const toggleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  return (
    <View className={`mb-4 flex-row ${isReply ? 'ml-10 mt-3' : ''}`}>
      {/* Avatar */}
      <View className="mr-3">
        <Avatar size={isReply ? 8 : 9} />
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row flex-wrap items-baseline">
          <Text className="mr-1 text-sm font-semibold text-gray-900">{comment.username}</Text>
          <Text className="mr-2 text-xs text-gray-400">{comment.time}</Text>
        </View>

        <Text className="mt-0.5 text-sm leading-5 text-gray-800">
          {comment.mention && <Text className="font-medium text-blue-500">{comment.mention} </Text>}
          {comment.text}
        </Text>

        {/* Actions */}
        <View className="mt-2 flex-row items-center gap-4">
          <TouchableOpacity>
            <Text className="text-xs font-medium text-gray-400">Trả lời</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Like */}
      <TouchableOpacity onPress={toggleLike} className="ml-2 items-center">
        <IconHeart filled={liked} size={14} />
        {likes > 0 && <Text className="mt-0.5 text-xs text-gray-400">{likes}</Text>}
      </TouchableOpacity>
    </View>
  );
};

export default function PostDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user: currentUser } = useAuth();
  const postParam = route.params?.post;
  const postId = route.params?.postId ?? postParam?.id ?? postParam?.postId;

  const [loading, setLoading] = useState(true);
  const [postingComment, setPostingComment] = useState(false);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [captionLiked, setCaptionLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comment, setComment] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const inputRef = useRef(null);

  const adapted = useMemo(() => (post ? adaptPostDetail(post) : null), [post]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!postId) {
        if (mounted) {
          setPost(null);
          setComments([]);
          setLoading(false);
        }
        return;
      }
      try {
        setLoading(true);
        const raw = await userService.getPost(postId);
        if (!mounted) return;
        const p = adaptPostDetail(raw);
        setPost(raw);
        setComments(adaptComments(p.comments));
        setCaptionLiked(p.liked);
        setLikes(p.likes);
        setIsFollowing(p.isFollowing);
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [postId]);

  const refresh = async () => {
    if (!postId) return;
    try {
      const raw = await userService.getPost(postId);
      const p = adaptPostDetail(raw);
      setPost(raw);
      setComments(adaptComments(p.comments));
      setCaptionLiked(p.liked);
      setLikes(p.likes);
      setIsFollowing(p.isFollowing);
    } catch {
      // ignore
    }
  };

  const toggleLike = async () => {
    if (!postId) return;
    // Optimistic UI
    const nextLiked = !captionLiked;
    setCaptionLiked(nextLiked);
    setLikes((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await userService.likePost(postId);
      await refresh();
    } catch {
      // rollback optimistic state
      const rollbackLiked = !nextLiked;
      setCaptionLiked(rollbackLiked);
      setLikes((prev) => (rollbackLiked ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleSendComment = async () => {
    if (!postId) return;
    const text = comment.trim();
    if (!text) return;
    try {
      setPostingComment(true);
      await userService.createComment(postId, text);
      setComment('');
      await refresh();
    } catch {
      // giữ UI đơn giản: không alert ở đây
    } finally {
      setPostingComment(false);
    }
  };

  const followId = adapted?.author?.id;
  
  // Kiểm tra bằng id hoặc username để chắc chắn đó là mình
  const isMyPost = Boolean(
    (followId && (currentUser?.id === followId || currentUser?.userId === followId)) ||
    (currentUser?.username && adapted?.author?.username && currentUser.username === adapted.author.username)
  );

  const toggleFollow = async () => {
    if (!followId) return;
    try {
      setIsFollowing((v) => !v);
      await userService.follow(followId);
    } catch {
      setIsFollowing((v) => !v);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ── Post Header ── */}
          <View className="flex-row items-center px-4 py-3">
            <Avatar size={10} />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-gray-900">
                {adapted?.author?.username ?? ''}
              </Text>
              <Text className="text-xs text-gray-400">{adapted?.author?.username ?? ''}</Text>
            </View>
            {isMyPost ? (
              <TouchableOpacity
                onPress={() => setShowOptions(true)}
                className="px-2 py-1.5"
                activeOpacity={0.8}>
                <IconMore />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Caption */}
          {loading ? (
            <View className="px-4 py-4">
              <Text className="text-sm text-gray-400">Đang tải bài viết...</Text>
            </View>
          ) : (
            <Text className="mb-3 px-4 text-sm text-gray-900">
              {adapted?.title ? <Text className="font-bold">{adapted.title}{"\n"}</Text> : null}
              {adapted?.content ?? ''}
            </Text>
          )}

          {/* ── Post Image ── */}
          <View
            style={{ width, height: width }}
            className="items-center justify-center border-b border-t border-gray-100 bg-gray-100 overflow-hidden">
            {adapted?.images?.[0]?.url ? (
               <Image source={{ uri: adapted.images[0].url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
               <View className="h-16 w-16 items-center justify-center rounded-xl border border-gray-300">
                 <Text style={{ fontSize: 32 }}>🖼️</Text>
               </View>
            )}
          </View>

          {/* ── Actions ── */}
          <View className="flex-row items-center px-4 pb-2 pt-3">
            <TouchableOpacity onPress={toggleLike} className="mr-1" activeOpacity={0.8}>
              <IconHeart filled={captionLiked} />
            </TouchableOpacity>
            <Text className="mr-4 text-sm font-semibold text-gray-900">
              {likes.toLocaleString()}
            </Text>

            <TouchableOpacity
              className="mr-1"
              onPress={() => inputRef.current?.focus()}
              activeOpacity={0.8}>
              <IconComment />
            </TouchableOpacity>
            <Text className="mr-4 text-sm font-semibold text-gray-900">
              {adapted?.commentCount ?? comments.length}
            </Text>

            <TouchableOpacity activeOpacity={0.8}>
              <IconShare />
            </TouchableOpacity>

            <View className="flex-1" />
          </View>

          {/* ── Comments Section ── */}
          <View className="px-4 pb-6 pt-2">
            <Text className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-900">
              Comments ({adapted?.commentCount ?? comments.length})
            </Text>

            {comments.map((c) => (
              <View key={c.id}>
                <CommentItem comment={c} />
                {c.replies?.map((r) => (
                  <CommentItem key={r.id} comment={r} isReply />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* ── Comment Input ── */}
        <View className="flex-row items-center border-t border-gray-100 bg-white px-4 py-3">
          <View className="mr-3">
            <Avatar size={8} />
          </View>
          <View className="flex-1 flex-row items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
            <TextInput
              ref={inputRef}
              className="flex-1 text-sm text-gray-900"
              placeholder="Nhập bình luận của bạn ..."
              placeholderTextColor="#9ca3af"
              value={comment}
              onChangeText={setComment}
              multiline
              returnKeyType="send"
              onSubmitEditing={handleSendComment}
              editable={!postingComment}
            />
          </View>
          <TouchableOpacity
            onPress={handleSendComment}
            className="ml-3"
            activeOpacity={0.8}
            disabled={!comment.trim() || postingComment}>
            <Text
              className={`text-sm font-bold ${comment.trim() ? 'text-blue-500' : 'text-gray-300'}`}>
              {postingComment ? '...' : 'ĐĂNG'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <PostOptionsModal
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        post={post}
        onDelete={async (id) => {
          try {
            await userService.deletePost(id);
            if (navigation.canGoBack()) {
              navigation.goBack();
            }
          } catch (e) {
            console.warn('Xoá bài thất bại:', e.message);
          }
        }}
      />
    </SafeAreaView>
  );
}
