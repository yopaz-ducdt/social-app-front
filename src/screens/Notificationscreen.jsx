import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTab from '../components/BottomTab';
import { userService } from '@/services/userService';

const normalizeNotification = (raw) => {
  const type = String(raw?.type ?? raw?.kind ?? '').toLowerCase();
  const id = String(raw?.id ?? raw?.reportId ?? raw?.notificationId ?? Math.random());
  const title = raw?.title ?? raw?.reason ?? 'Thông báo hệ thống';
  const subtitle = raw?.content ?? raw?.body ?? raw?.description ?? null;
  const time = raw?.time ?? raw?.createdAt ?? raw?.createdDate ?? '';

  const followerId =
    raw?.followerId ??
    raw?.actorId ??
    raw?.fromUserId ??
    raw?.userId ??
    raw?.senderId ??
    raw?.actor?.id;

  const isFollowing = Boolean(raw?.isFollowing ?? raw?.following ?? false);

  // Tùy backend, "follow" có thể được trả về khi có followerId
  const canFollow = type.includes('follow') || followerId;

  return {
    id: id || String(Math.random()),
    type: type || 'user',
    title,
    subtitle,
    time,
    unread: Boolean(raw?.unread ?? raw?.isUnread ?? raw?.read === false),
    action: canFollow ? 'follow' : 'more',
    isFollowing,
    followerId: followerId ? String(followerId) : null,
    raw,
  };
};

// ─── Icons ───────────────────────────────────────────────────
const IconUser = () => <Text style={{ fontSize: 20 }}>👤</Text>;
const IconShield = () => <Text style={{ fontSize: 18 }}>🛡️</Text>;
const IconHeart = () => <Text style={{ fontSize: 14, color: '#ef4444' }}>♥</Text>;
const IconComment = () => <Text style={{ fontSize: 14, color: '#6b7280' }}>💬</Text>;
const IconMention = () => <Text style={{ fontSize: 14, color: '#6b7280' }}>@</Text>;
const IconMore = () => <Text style={{ fontWeight: 500, color: '#9ca3af' }}>•••</Text>;

// Badge icon tuỳ type
const TypeBadge = ({ type }) => {
  const map = {
    like: { bg: 'bg-red-100', icon: <IconHeart /> },
    comment: { bg: 'bg-gray-100', icon: <IconComment /> },
    mention: { bg: 'bg-blue-100', icon: <IconMention /> },
  };
  const config = map[type];
  if (!config) return null;
  return (
    <View
      className={`absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full ${config.bg} items-center justify-center border border-white`}>
      {config.icon}
    </View>
  );
};

// ─── Avatar ──────────────────────────────────────────────────
const Avatar = ({ type }) => {
  if (type === 'security') {
    return (
      <View className="h-11 w-11 items-center justify-center rounded-full bg-gray-900">
        <IconShield />
      </View>
    );
  }
  return (
    <View className="relative">
      <View className="h-11 w-11 items-center justify-center rounded-full bg-gray-200">
        <IconUser />
      </View>
      <TypeBadge type={type} />
    </View>
  );
};

// ─── Follow Button ────────────────────────────────────────────
const FollowButton = ({ isFollowing, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`rounded-lg border px-4 py-1.5 ${
        isFollowing ? 'border-gray-300 bg-white' : 'border-gray-900 bg-white'
      }`}>
      <Text className={`text-sm font-semibold ${isFollowing ? 'text-gray-500' : 'text-gray-900'}`}>
        {isFollowing ? 'Đã theo dõi' : 'Theo dõi lại'}
      </Text>
    </TouchableOpacity>
  );
};

// ─── Thumbnail placeholder ────────────────────────────────────
const Thumbnail = () => (
  <View className="h-11 w-11 items-center justify-center rounded-md border border-gray-200 bg-gray-100">
    <Text style={{ fontSize: 18 }}>🖼️</Text>
  </View>
);

// ─── Notification Item ────────────────────────────────────────
const NotifItem = ({ item, onToggleFollow }) => {
  const [isFollowing, setIsFollowing] = useState(Boolean(item.isFollowing || false));

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      className={`flex-row items-center px-4 py-3 ${item.unread ? 'bg-gray-50' : 'bg-white'}`}>
      {/* Avatar */}
      <View className="mr-3">
        <Avatar type={item.type} />
      </View>

      {/* Content */}
      <View className="mr-2 flex-1">
        <Text className="text-sm leading-5 text-gray-900" numberOfLines={2}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text className="mt-0.5 text-sm text-gray-500" numberOfLines={1}>
            {item.subtitle}
          </Text>
        )}
        <Text className="mt-1 text-xs text-gray-400">{item.time}</Text>
      </View>

      {/* Right action */}
      {item.action === 'follow' && (
        <FollowButton
          isFollowing={isFollowing}
          onPress={async () => {
            const prev = isFollowing;
            const next = !prev;
            setIsFollowing(next);
            try {
              await onToggleFollow?.(item);
            } catch {
              setIsFollowing(prev);
            }
          }}
        />
      )}
      {item.action === 'thumbnail' && <Thumbnail />}
      {item.action === 'more' && (
        <TouchableOpacity className="p-1">
          <IconMore />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────
export default function NotificationScreen() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const response = await userService.getMyReports(0, 20);
        // Hỗ trợ bóc tách dữ liệu linh hoạt từ nhiều định dạng response của backend
        const items =
          response?.content ??
          response?.data?.content ??
          response?.items ??
          response?.data ??
          (Array.isArray(response) ? response : []);
        if (!mounted) return;
        const normalized = Array.isArray(items) ? items.map(normalizeNotification) : [];
        setNotifications(normalized);
      } catch {
        if (mounted) setNotifications([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item, index }) => (
          <NotifItem
            item={item}
            onToggleFollow={async (notif) => {
              if (!notif.followerId) return;
              try {
                await userService.follow(notif.followerId);
              } catch (e) {
                Alert.alert('Thất bại', e.message);
                throw e;
              }
            }}
          />
        )}
        ItemSeparatorComponent={() => <View className="mx-4 h-px bg-gray-100" />}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-sm text-gray-400">Không có thông báo</Text>
          </View>
        }
      />

      {/* Bottom Tab */}
      <BottomTab />
    </SafeAreaView>
  );
}
