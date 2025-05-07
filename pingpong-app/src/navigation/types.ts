// src/navigation/types.ts

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  AddMatch: undefined;
  HomeScreen: undefined;
  PlayerScreen: undefined;
  TournamentScreen: undefined;
  RankingScreen: undefined;
  MatchesScreen: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  PlayersTab: undefined;
  TournamentsTab: undefined;
  RankingsTab: undefined;
  MatchesTab: undefined;
  Settings: undefined;
};

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type TabNavigationProp = BottomTabNavigationProp<MainTabParamList>;
