import { useRef, useState, useEffect } from 'react';
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
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import LogoApp from '@/components/LogoApp';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();
  const passwordRef = useRef(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    try {
      setLoading(true);
      const data = await authService.login(username.trim(), password);

      const token =
        typeof data === 'string'
          ? data
          : data?.token ?? data?.accessToken ?? data?.jwt ?? '';

      if (!token) throw new Error('Không nhận được token từ server.');
      await login(token);
    } catch (error) {
      Alert.alert('Đăng nhập thất bại', error.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <View className="flex-1 px-6 pb-10 pt-16">
            <LogoApp size={60} className="self-center mb-8" />

            <Text className="mb-10 text-center text-2xl font-bold text-gray-900">
              Chào mừng trở lại
            </Text>

            {/* USERNAME */}
            <View className="mb-5">
              <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                Tên đăng nhập (Username/Email)
              </Text>
              <TextInput
                className="rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900"
                placeholder="Nhập username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!loading}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            {/* PASSWORD */}
            <View className="mb-2">
              <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                Mật khẩu
              </Text>
              <View className="flex-row items-center rounded-lg border border-gray-300 px-4">
                <TextInput
                  ref={passwordRef}
                  className="flex-1 py-3 text-base text-gray-900"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              className="mb-8 items-end"
              onPress={() => navigation.navigate('ForgotPassword')}>
              <Text className="text-sm text-gray-500">Quên mật khẩu ?</Text>
            </TouchableOpacity>

            {/* LOGIN */}
            <TouchableOpacity
              className={`mb-6 items-center rounded-lg py-4 ${loading ? 'bg-gray-400' : 'bg-black'}`}
              onPress={handleLogin}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold">Đăng nhập</Text>
              )}
            </TouchableOpacity>

            {/* DIVIDER */}
            <View className="mb-6 flex-row items-center">
              <View className="h-px flex-1 bg-gray-200" />
              <Text className="mx-4 text-xs text-gray-400">Hoặc</Text>
              <View className="h-px flex-1 bg-gray-200" />
            </View>

            {/* GOOGLE LOGIN */}
            {/* <TouchableOpacity
              className="mb-10 flex-row items-center justify-center rounded-lg border border-gray-200 py-3.5"
              onPress={() => promptAsync()}
              disabled={!request || loading}>
              {loading ? (
                <ActivityIndicator />
              ) : (
                <Text>Đăng nhập với Google</Text>
              )}
            </TouchableOpacity> */}

            {/* SIGNUP */}
            <View className="flex-row justify-center">
              <Text className="text-sm text-gray-500">Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text className="text-sm font-semibold text-black underline">
                  Nhấn vào đây
                </Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
