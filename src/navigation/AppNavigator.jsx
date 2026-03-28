import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/screens/HomeScreen';
import LoginScreen from '@/screens/LoginScreen';
import SignupScreen from '@/screens/SignupScreen';
import PostDetailScreen from '@/screens/PostDetailScreen';
import AppHeader from '@/components/AppHeader';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import NotificationScreen from '@/screens/Notificationscreen';
import ForgotPasswordScreen from '@/screens/ForgotPasswordScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import EditProfileScreen from '@/screens/EditProfileScreen';
import CreatePostScreen from '@/screens/CreatePostScreen';
import AdminDashboardScreen from '@/screens/AdmindashboardScreen';
import EditPostScreen from '@/screens/EditPostScreen';
import AdminUsersScreen from '@/screens/AdminUserScreen';
import AdminContentScreen from '@/screens/AdminContentScreen';
import SearchScreen from '@/screens/SearchScreen';
import { useAuth } from '@/context/AuthContext';
import UserProfileScreen from '@/screens/UserProfileScreen';

const Stack = createNativeStackNavigator();

const makeHeader = ({ title, showBack, rightElement, showBorder } = {}) => ({
  header: () => (
    <AppHeader
      title={title}
      showBack={showBack}
      rightElement={rightElement}
      showBorder={showBorder}
    />
  ),
});

export default function AppNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      {token ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />

          {/* ── Search Screen ── */}
          <Stack.Screen name="Search" component={SearchScreen} />

          <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ headerShown: false }} />

          <Stack.Screen name="CreatePost" component={CreatePostScreen} />

          <Stack.Screen
            name="Notification"
            component={NotificationScreen}
            options={{
              headerShown: true,
              ...makeHeader({ title: 'Thông báo', showBack: true }),
            }}
          />

          <Stack.Screen
            name="PostDetail"
            component={PostDetailScreen}
            options={{
              headerShown: true,
              ...makeHeader({
                title: 'Bài đăng',
                showBack: true,
                rightElement: (
                  <TouchableOpacity>
                    <Text style={{ fontSize: 16, color: '#555' }}>•••</Text>
                  </TouchableOpacity>
                ),
              }),
            }}
          />

          <Stack.Screen name="EditPost" component={EditPostScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
          <Stack.Screen name="AdminContent" component={AdminContentScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
