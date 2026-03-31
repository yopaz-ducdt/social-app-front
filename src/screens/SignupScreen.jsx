import { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '@/services/authService';
import LogoApp from '@/components/LogoApp';

const GoogleIcon = () => <View className="mr-2 h-5 w-5 rounded-full bg-gray-300" />;

const EyeIcon = ({ visible }) => (
  <Text className="text-base text-gray-400">{visible ? '🙈' : '👁'}</Text>
);

const GENDER_OPTIONS = [
  { label: 'Nam', value: 'male' },
  { label: 'Nữ', value: 'female' },
];

export default function SignupScreen() {
  const navigation = useNavigation();
  const lastNameRef = useRef(null);
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('male');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Thông báo', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setLoading(true);
      await authService.register({
        username: username.trim(),
        password,
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
      });
      Alert.alert('Thành công', 'Đăng ký thành công! Vui lòng đăng nhập.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      Alert.alert('Đăng ký thất bại', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-6 pb-10 pt-12">
          <View className="mb-6 flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
              <Text className="text-xl text-gray-900">‹</Text>
            </TouchableOpacity>
            <Text className="flex-1 text-center text-base font-bold uppercase tracking-widest text-gray-900">
              Đăng ký
            </Text>
            <View className="w-6" />
          </View>

          <LogoApp size={60} className="self-center mb-8" />

          <View className="mb-4 flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                Họ
              </Text>
              <TextInput
                className="rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900"
                placeholder="Nguyễn"
                placeholderTextColor="#9ca3af"
                value={firstName}
                onChangeText={setFirstName}
                editable={!loading}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => lastNameRef.current?.focus()}
              />
            </View>
            <View className="flex-1">
              <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                Tên
              </Text>
              <TextInput
                ref={lastNameRef}
                className="rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900"
                placeholder="Văn A"
                placeholderTextColor="#9ca3af"
                value={lastName}
                onChangeText={setLastName}
                editable={!loading}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => usernameRef.current?.focus()}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Tên Đăng Nhập
            </Text>
            <TextInput
              ref={usernameRef}
              className="rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900"
              placeholder="Username"
              placeholderTextColor="#9ca3af"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!loading}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Giới Tính
            </Text>
            <View className="flex-row gap-3">
              {GENDER_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  className="flex-1 flex-row items-center rounded-lg border border-gray-300 px-4 py-3"
                  onPress={() => setGender(opt.value)}
                  disabled={loading}>
                  <View
                    className={`mr-2 h-4 w-4 items-center justify-center rounded-full border-2 ${gender === opt.value ? 'border-black' : 'border-gray-400'}`}>
                    {gender === opt.value && <View className="h-2 w-2 rounded-full bg-black" />}
                  </View>
                  <Text className="text-base text-gray-900">{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Địa Chỉ Email
            </Text>
            <TextInput
              ref={emailRef}
              className="rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900"
              placeholder="name@gmail.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Mật Khẩu
            </Text>
            <View className="flex-row items-center rounded-lg border border-gray-300 px-4">
              <TextInput
                ref={passwordRef}
                className="flex-1 py-3 text-base text-gray-900"
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                <EyeIcon visible={showPassword} />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-8">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Xác Nhận Mật Khẩu
            </Text>
            <View className="flex-row items-center rounded-lg border border-gray-300 px-4">
              <TextInput
                ref={confirmPasswordRef}
                className="flex-1 py-3 text-base text-gray-900"
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} className="p-1">
                <EyeIcon visible={showConfirm} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className={`items-center rounded-lg py-4 ${loading ? 'bg-gray-400' : 'bg-black'}`}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-base font-bold uppercase tracking-widest text-white">
                Đăng ký
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
