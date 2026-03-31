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

const { width } = Dimensions.get('window');

// Normalize response shape theo PostResponse schema API
const adaptPostDetail = (raw) => {
  const userResponse = raw?.userResponse ?? raw?.user ?? raw?.author ?? null;
  const images =
    Array.isArray(raw?.images) && raw.images.length > 0
      ? raw.images.filter((item) => item?.url)
      : [];
  const fullName = [userResponse?.firstName, userResponse?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return {
    id: String(raw?.id ?? ''),
    title: raw?.title ?? '',
    content: raw?.content ?? '',
    likes: Number(raw?.like ?? 0) || 0,
    images,
    commentCount: raw?.commentResponseList?.length ?? 0,
    author: {
      name: fullName || raw?.username || userResponse?.username || '',
      username: userResponse?.username ?? raw?.username ?? raw?.author?.username ?? '',
      id: userResponse?.id ?? raw?.authorId ?? raw?.userId ?? null,
      avatarUrl: userResponse?.image?.url ?? raw?.author?.image?.url ?? raw?.image?.url ?? null,
    },
    isFollowing: Boolean(raw?.isFollowing ?? false),
    liked: Boolean(raw?.liked ?? raw?.isLiked ?? false),
    comments: raw?.commentResponseList ?? [],
    raw,
  };
};

const mergePostDetail = (basePost, detailPost) => {
  if (!basePost) return detailPost;
  if (!detailPost) return basePost;

  return {
    ...basePost,
    ...detailPost,
    userResponse: detailPost?.userResponse ?? basePost?.userResponse,
    username: detailPost?.username ?? basePost?.username,
    author: detailPost?.author ?? basePost?.author,
    user: detailPost?.user ?? basePost?.user,
    image: detailPost?.image ?? basePost?.image,
    images:
      Array.isArray(detailPost?.images) && detailPost.images.length > 0
        ? detailPost.images
        : basePost?.images,
    commentResponseList: detailPost?.commentResponseList ?? basePost?.commentResponseList,
  };
};

const adaptComments = (rawComments) => {
  const arr = Array.isArray(rawComments) ? rawComments : [];
  return arr.map((c) => ({
    id: String(c?.id ?? Math.random()),
    username: c?.fullName ?? c?.username ?? 'unknown',
    userId: c?.userId ?? '',
    text: c?.content ?? '',
    avatarUrl: c?.url ?? '',
    likes: 0,
    liked: false,
    raw: c,
  }));
};

// ─── Icons ───────────────────────────────────────────────────
const IconHeart = ({ filled, size = 22 }) => (
  <Text style={{ fontSize: size }}>{filled ? '❤️' : '🤍'}</Text>
);

// ─── Avatar placeholder ───────────────────────────────────────
const Avatar = ({ size = 10, uri = null }) => (
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

// ─── Comment Item ─────────────────────────────────────────────
const CommentItem = ({ comment, isReply = false, onPressUser }) => {
  return (
    <View className={`mb-4 flex-row ${isReply ? 'ml-10 mt-3' : ''}`}>
      {/* Avatar */}
      <TouchableOpacity
        className="mr-3"
        activeOpacity={0.8}
        onPress={() => onPressUser?.(comment.userId)}>
        <Avatar size={isReply ? 8 : 9} uri={comment.avatarUrl} />
      </TouchableOpacity>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row flex-wrap items-baseline">
          <TouchableOpacity activeOpacity={0.8} onPress={() => onPressUser?.(comment.userId)}>
            <Text className="mr-1 text-sm font-semibold text-gray-900">{comment.username}</Text>
          </TouchableOpacity>
          <Text className="mr-2 text-xs text-gray-400">{comment.time}</Text>
        </View>
      </View>
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
        const mergedPost = mergePostDetail(postParam, raw);
        const p = adaptPostDetail(mergedPost);
        setPost(mergedPost);
        setComments(adaptComments(p.comments));
        setCaptionLiked(p.liked);
        setLikes(p.likes);
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [postId, postParam]);

  const refresh = async () => {
    if (!postId) return;
    try {
      const raw = await userService.getPost(postId);
      const mergedPost = mergePostDetail(postParam, raw);
      const p = adaptPostDetail(mergedPost);
      setPost(mergedPost);
      setComments(adaptComments(p.comments));
      setCaptionLiked(p.liked);
      setLikes(p.likes);
    } catch {
      // ignore
    }
  };

  const toggleLike = async () => {
    if (!postId) return;
    const nextLiked = !captionLiked;
    setCaptionLiked(nextLiked);
    setLikes((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      await userService.likePost(postId);
      await refresh();
    } catch {
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

  const openAuthorProfile = () => {
    const authorId = String(adapted?.author?.id ?? '');
    const myId = String(currentUser?.id ?? currentUser?.userId ?? '');

    if (!authorId) return;

    if (authorId === myId) {
      navigation.navigate('Profile');
      return;
    }

    navigation.navigate('UserProfile', { userId: authorId });
  };

  const openUserProfile = (targetUserId) => {
    const normalizedTargetId = String(targetUserId ?? '');
    const myId = String(currentUser?.id ?? currentUser?.userId ?? '');

    if (!normalizedTargetId) return;

    if (normalizedTargetId === myId) {
      navigation.navigate('Profile');
      return;
    }

    navigation.navigate('UserProfile', { userId: normalizedTargetId });
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ── Post Header ── */}
          <TouchableOpacity
            className="flex-row items-center px-4 py-3"
            activeOpacity={0.8}
            onPress={openAuthorProfile}>
            <Avatar size={10} uri={adapted?.author?.avatarUrl} />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-gray-900">
                {adapted?.author?.name ?? adapted?.author?.username ?? ''}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Caption */}
          {loading ? (
            <View className="px-4 py-4">
              <Text className="text-sm text-gray-400">Đang tải bài viết...</Text>
            </View>
          ) : (
            <Text className="mb-3 px-4 text-sm text-gray-900">
              {adapted?.title ? (
                <Text className="font-bold">
                  {adapted.title}
                  {'\n'}
                </Text>
              ) : null}
              {adapted?.content ?? ''}
            </Text>
          )}

          {/* ── Post Images ── */}
          {adapted?.images?.length ? (
            adapted.images.map((item, index) => (
              <View
                key={`${adapted.id}-${item.id ?? item.url ?? index}`}
                style={{ width, height: width }}
                className="items-center justify-center overflow-hidden border-b border-t border-gray-100 bg-gray-100">
                <Image
                  source={{ uri: item.url }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
            ))
          ) : (
            <View
              style={{ width, height: width }}
              className="items-center justify-center overflow-hidden border-b border-t border-gray-100 bg-gray-100">
              <View className="h-16 w-16 items-center justify-center rounded-xl border border-gray-300">
                <Text style={{ fontSize: 32 }}>🖼️</Text>
              </View>
            </View>
          )}

          {/* ── Actions ── */}
          <View className="flex-row items-center px-4 pb-2 pt-3">
            <TouchableOpacity onPress={toggleLike} className="mr-1" activeOpacity={0.8}>
              <IconHeart filled={captionLiked} />
            </TouchableOpacity>
            <Text className="mr-4 text-sm font-semibold text-gray-900">
              {likes.toLocaleString()}
            </Text>
            <View className="flex-1" />
          </View>

          {/* ── Comments Section ── */}
          <View className="px-4 pb-6 pt-2">
            <Text className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-900">
              Comments ({adapted?.commentCount ?? comments.length})
            </Text>

            {comments.map((c) => (
              <View key={c.id}>
                <CommentItem comment={c} onPressUser={openUserProfile} />
                {c.replies?.map((r) => (
                  <CommentItem key={r.id} comment={r} isReply onPressUser={openUserProfile} />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* ── Comment Input ── */}
        <View className="flex-row items-center border-t border-gray-100 bg-white px-4 py-3">
          <View className="mr-3">
            <Avatar size={8} uri={currentUser?.image?.url} />
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
    </SafeAreaView>
  );
}
