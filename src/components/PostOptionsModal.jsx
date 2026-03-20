import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';

/**
 * PostOptionsModal — Bottom sheet tuỳ chọn bài viết
 *
 * Props:
 * - visible   (boolean)  : Hiện/ẩn modal
 * - onClose   (function) : Đóng modal
 * - post      (object)   : Dữ liệu bài viết
 * - onDelete  (function) : Callback sau khi xoá
 */
export default function PostOptionsModal({ visible, onClose, post, onDelete }) {
  const navigation = useNavigation();

  const handleEdit = () => {
    onClose();
    navigation.navigate('EditPost', { post });
  };

  const handleDelete = () => {
    onClose();
    onDelete?.(post?.id);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/40" />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <View className="rounded-t-2xl bg-white px-4 pb-10 pt-3">
        {/* Handle bar */}
        <View className="mb-5 h-1 w-10 self-center rounded-full bg-gray-300" />

        {/* Sửa */}
        <TouchableOpacity
          onPress={handleEdit}
          activeOpacity={0.7}
          className="flex-row items-center border-b border-gray-100 py-4">
          <Text style={{ fontSize: 20, width: 32 }}>✏️</Text>
          <Text className="text-base text-gray-900">Chỉnh sửa bài viết</Text>
        </TouchableOpacity>

        {/* Xoá */}
        <TouchableOpacity
          onPress={handleDelete}
          activeOpacity={0.7}
          className="flex-row items-center py-4">
          <Text style={{ fontSize: 20, width: 32 }}>🗑️</Text>
          <Text className="text-base text-red-500">Xoá bài viết</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
