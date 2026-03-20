import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/screens/HomeScreen';
import LoginScreen from '@/screens/LoginScreen';
import SignupScreen from '@/screens/SignupScreen';
import PostDetailScreen from '@/screens/PostDetailScreen';
import AppHeader from '@/components/AppHeader';
import { TouchableOpacity, Text } from 'react-native';
import NotificationScreen from '@/screens/Notificationscreen';
import ForgotPasswordScreen from '@/screens/ForgotPasswordScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import DevMenuScreen from '@/screens/DevMenuScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import EditProfileScreen from '@/screens/EditProfileScreen';
import CreatePostScreen from '@/screens/CreatePostScreen';
import AdminDashboardScreen from '@/screens/AdmindashboardScreen';
import EditPostScreen from '@/screens/EditPostScreen';
import AdminUsersScreen from '@/screens/AdminUserScreen';
import AdminContentScreen from '@/screens/AdminContentScreen';

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
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="DevMenu" component={DevMenuScreen} options={{ headerShown: false }} />

      <Stack.Screen name="Login" component={LoginScreen} />

      <Stack.Screen name="Signup" component={SignupScreen} />

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="Home" component={HomeScreen} />

      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ headerShown: false }}
      />

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

      <Stack.Screen name="EditPost" component={EditPostScreen} options={{ headerShown: false }} />

      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />

      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />

      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AdminContent"
        component={AdminContentScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
