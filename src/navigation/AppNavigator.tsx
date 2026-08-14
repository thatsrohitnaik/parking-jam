import { createNativeStackNavigator } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Game: undefined;
  LevelSelect: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import GameScreen from '../screens/GameScreen';
import LevelSelectScreen from '../screens/LevelSelectScreen';

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Game" component={GameScreen} />
      <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
    </Stack.Navigator>
  );
}