// src/screens/MatchesScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Surface, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { getMatches, deleteMatch } from '../api/api';
import { authService } from '../api/authService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type MatchesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

interface Match {
  id: number;
  player1_id: number;
  player2_id: number;
  player1_result: string;
  player2_result: string;
  match_date: string;
  winner_id: number;
  player1_name: string;
  player2_name: string;
  winner_name: string;
}

const MatchesScreen = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<MatchesScreenNavigationProp>();
  const theme = useTheme();

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await getMatches();
      setMatches(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las partidas');
      console.error('Error al cargar partidas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleDeleteMatch = async (matchId: number) => {
    try {
      await deleteMatch(matchId);
      setMatches(matches.filter(match => match.id !== matchId));
      Alert.alert('Éxito', 'Partida eliminada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la partida');
    }
  };

  const handleNewMatch = () => {
    navigation.navigate('AddMatch');
  };

  const renderMatch = ({ item }: { item: Match }) => (
    <Card style={styles.matchCard}>
      <Card.Content>
        <Text style={styles.matchTitle}>
          {item.player1_name} vs {item.player2_name}
        </Text>
        <Text style={styles.matchDate}>
          Fecha: {new Date(item.match_date).toLocaleDateString()}
        </Text>
        <Text style={styles.matchResult}>
          Ganador: {item.winner_name}
        </Text>
        <Text style={styles.matchScore}>
          Resultado: {item.player1_result === 'win' ? 'Ganó' : 'Perdió'} {item.player1_name} - 
          {item.player2_result === 'win' ? 'Ganó' : 'Perdió'} {item.player2_name}
        </Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => handleDeleteMatch(item.id)}>Eliminar</Button>
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button onPress={fetchMatches}>Reintentar</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons name="history" size={32} color={theme.colors.primary} />
          <Text style={styles.title}>Historial de Partidas</Text>
        </View>
        <Button 
          mode="contained" 
          onPress={handleNewMatch}
          style={styles.newMatchButton}
          icon={({ size, color }) => (
            <MaterialCommunityIcons name="plus" size={size} color={color} />
          )}
        >
          Nueva Partida
        </Button>
      </Surface>
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    elevation: 4,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  newMatchButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  listContainer: {
    padding: 16,
  },
  matchCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 8,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  matchDate: {
    color: '#666',
    marginBottom: 4,
  },
  matchResult: {
    color: '#2196F3',
    marginBottom: 4,
  },
  matchScore: {
    color: '#4CAF50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default MatchesScreen;
