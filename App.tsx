import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from '@/screens/HomeScreen';
import '@/global.css';

export default function App() {
  return (
    <SafeAreaProvider>
      <HomeScreen />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}