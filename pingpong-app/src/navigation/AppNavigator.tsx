// src/navigation/AppNavigator.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { RootStackParamList, MainTabParamList } from './types';

// Screens
import HomeScreen from '../screens/HomeScreen';
import PlayersScreen from '../screens/PlayersScreen';
import TournamentScreen from '../screens/TournamentScreen';
import RankingScreen from '../screens/RankingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddMatchScreen from '../screens/AddMatchScreen';
import MatchesScreen from '../screens/MatchesScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function PlayerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="PlayerScreen" 
        component={PlayersScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function MatchesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MatchesScreen" 
        component={MatchesScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function TournamentStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TournamentScreen" 
        component={TournamentScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function RankingStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="RankingScreen" 
        component={RankingScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

const MainTabs = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: '#ddd',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="PlayersTab"
        component={PlayerStack}
        options={{
          tabBarLabel: 'Jugadores',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MatchesTab"
        component={MatchesStack}
        options={{
          tabBarLabel: 'Partidos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="table-tennis" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="TournamentsTab"
        component={TournamentStack}
        options={{
          tabBarLabel: 'Torneos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="trophy" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="RankingsTab"
        component={RankingStack}
        options={{
          tabBarLabel: 'Rankings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="podium" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="AddMatch" component={AddMatchScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
