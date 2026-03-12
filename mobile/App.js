import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import VoiceAssistantScreen from './src/screens/VoiceAssistantScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { colors } from './src/theme/colors';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                const iconName =
                  route.name === 'Assistant'
                    ? focused ? 'mic' : 'mic-outline'
                    : focused ? 'time' : 'time-outline';
                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.textSecondary,
              tabBarStyle: {
                backgroundColor: colors.background,
                borderTopColor: colors.accentLight,
                elevation: 8,
                shadowColor: colors.primary,
                shadowOpacity: 0.1,
                shadowOffset: { width: 0, height: -2 },
                shadowRadius: 8,
              },
              headerStyle: {
                backgroundColor: colors.background,
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 1,
                borderBottomColor: colors.accentLight,
              },
              headerTitleStyle: {
                color: colors.primary,
                fontWeight: '700',
                fontSize: 18,
              },
            })}
          >
            <Tab.Screen
              name="Assistant"
              component={VoiceAssistantScreen}
              options={{ title: 'JUMC AI Assistant' }}
            />
            <Tab.Screen
              name="History"
              component={HistoryScreen}
              options={{ title: 'Command History' }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
