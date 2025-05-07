import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, ViewStyle, TextStyle, Alert } from 'react-native';
import { Button, Text, Surface, useTheme, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { playerService, Player } from '../api/playerService';
import { useApp } from '../context/AppContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const theme = useTheme();
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const dynamicStyles = StyleSheet.create({
    goldPlayerName: {
      fontSize: 16,
      color: theme.colors.primary,
    },
    victoriesContainer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 4,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
  });

    const fetchTopPlayers = async () => {
      try {
      const players = await playerService.getPlayers();
      // Ordenar por victorias y tomar los primeros 3
      const sortedPlayers = [...players].sort((a, b) => b.victories - a.victories).slice(0, 3);
        setTopPlayers(sortedPlayers);
      } catch (error) {
        console.error('Error al obtener top jugadores:', error);
      Alert.alert('Error', 'No se pudieron cargar los jugadores');
    } finally {
      setLoading(false);
      }
    };

  useEffect(() => {
    fetchTopPlayers();
  }, []);

  const handleAddMatch = () => {
    navigation.navigate('AddMatch');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <Surface style={styles.header} elevation={2}>
          <View style={styles.headerContent}>
            <MaterialCommunityIcons 
              name="table-tennis" 
              size={60}
              color={theme.colors.primary}
            />
            <Text variant="titleLarge" style={styles.title}>
              Bienvenido a Ping Pong App
            </Text>
          </View>
        </Surface>

        <Surface style={styles.podiumContainer} elevation={2}>
          <View style={styles.podiumHeader}>
            <MaterialCommunityIcons name="trophy" size={32} color={theme.colors.primary} />
            <Text variant="titleLarge" style={styles.podiumTitle}>
              Top Jugadores
            </Text>
          </View>
          <View style={styles.podium}>
            {topPlayers.length >= 2 && (
              <Surface
                style={[
                  styles.podiumPosition,
                  styles.silverPosition,
                  {
                    height: 120,
                    backgroundColor: theme.colors.surfaceVariant,
                  },
                ]}
                elevation={3}
              >
                <View style={[styles.medalContainer, { backgroundColor: '#E8E8E8' }]}>
                  <MaterialCommunityIcons name="medal" size={32} color="#C0C0C0" />
                  <Text style={styles.medalText}>2°</Text>
                </View>
                <Text style={styles.playerName}>{topPlayers[1].name}</Text>
                <View style={dynamicStyles.victoriesContainer}>
                  <MaterialCommunityIcons name="star" size={16} color={theme.colors.primary} />
                  <Text style={styles.victories}>{topPlayers[1].victories} victorias</Text>
                </View>
              </Surface>
            )}

            {topPlayers.length >= 1 && (
              <Surface
                style={[
                  styles.podiumPosition,
                  styles.goldPosition,
                  {
                    height: 150,
                    backgroundColor: theme.colors.surfaceVariant,
                  },
                ]}
                elevation={3}
              >
                <View style={[styles.medalContainer, { backgroundColor: '#FFF7E6' }]}>
                  <MaterialCommunityIcons name="medal" size={40} color="#FFD700" />
                  <Text style={[styles.medalText, { color: '#B8860B' }]}>1°</Text>
                </View>
                <Text style={[styles.playerName, dynamicStyles.goldPlayerName]}>{topPlayers[0].name}</Text>
                <View style={dynamicStyles.victoriesContainer}>
                  <MaterialCommunityIcons name="star" size={16} color={theme.colors.primary} />
                  <Text style={styles.victories}>{topPlayers[0].victories} victorias</Text>
                </View>
              </Surface>
            )}

            {topPlayers.length >= 3 && (
              <Surface
                style={[
                  styles.podiumPosition,
                  styles.bronzePosition,
                  {
                    height: 100,
                    backgroundColor: theme.colors.surfaceVariant,
                  },
                ]}
                elevation={3}
              >
                <View style={[styles.medalContainer, { backgroundColor: '#FFE5D6' }]}>
                  <MaterialCommunityIcons name="medal" size={28} color="#CD7F32" />
                  <Text style={[styles.medalText, { color: '#8B4513' }]}>3°</Text>
                </View>
                <Text style={styles.playerName}>{topPlayers[2].name}</Text>
                <View style={dynamicStyles.victoriesContainer}>
                  <MaterialCommunityIcons name="star" size={16} color={theme.colors.primary} />
                  <Text style={styles.victories}>{topPlayers[2].victories} victorias</Text>
                </View>
              </Surface>
            )}
          </View>
        </Surface>

        <View style={styles.buttonsContainer}>
          <Button
            mode="contained"
            onPress={handleAddMatch}
            style={styles.button}
            icon={({ size, color }) => (
              <MaterialCommunityIcons name="plus" size={size} color={color} />
            )}
          >
            Nuevo Partido
          </Button>

          <Button
            mode="contained-tonal"
            onPress={() => navigation.navigate('MainTabs', { screen: 'MatchesTab' })}
            style={styles.button}
            icon={({ size, color }) => (
              <MaterialCommunityIcons name="clock-outline" size={size} color={color} />
            )}
          >
            Ver Partidos
          </Button>

          <Button
            mode="contained-tonal"
            onPress={() => navigation.navigate('MainTabs', { screen: 'PlayersTab' })}
            style={styles.button}
            icon={({ size, color }) => (
              <MaterialCommunityIcons name="account-group-outline" size={size} color={color} />
            )}
          >
            Gestionar Jugadores
          </Button>

          <Button
            mode="contained-tonal"
            onPress={() => navigation.navigate('MainTabs', { screen: 'RankingTab' })}
            style={styles.button}
            icon={({ size, color }) => (
              <MaterialCommunityIcons name="trophy-outline" size={size} color={color} />
            )}
          >
            Ver Ranking
          </Button>

          <Button
            mode="contained-tonal"
            onPress={() => navigation.navigate('Tournament')}
            style={styles.button}
            icon={({ size, color }) => (
              <MaterialCommunityIcons name="tournament" size={size} color={color} />
            )}
          >
            Torneo Rápido
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    marginTop: 8,
    textAlign: 'center',
  },
  podiumContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  podiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  podiumTitle: {
    fontWeight: 'bold',
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 170,
    gap: 8,
  },
  podiumPosition: {
    width: 100,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    paddingTop: 8,
  },
  goldPosition: {
    zIndex: 3,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  silverPosition: {
    zIndex: 2,
    marginRight: -4,
  },
  bronzePosition: {
    zIndex: 1,
    marginLeft: -4,
  },
  medalContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  medalText: {
    fontSize: 12,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: -4,
  },
  playerName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  victories: {
    fontSize: 12,
    opacity: 0.8,
  },
  buttonsContainer: {
    padding: 16,
    gap: 12,
  },
  button: {
    marginVertical: 8,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen; 