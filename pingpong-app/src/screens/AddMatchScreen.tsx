import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, TextInput, Surface, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { getPlayers, addMatch } from '../api/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

type AddMatchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddMatch'>;

interface Player {
  id: number;
  name: string;
}

const AddMatchScreen = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer1, setSelectedPlayer1] = useState<number | null>(null);
  const [selectedPlayer2, setSelectedPlayer2] = useState<number | null>(null);
  const [player1Result, setPlayer1Result] = useState<'win' | 'lose'>('win');
  const [player2Result, setPlayer2Result] = useState<'win' | 'lose'>('lose');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const navigation = useNavigation<AddMatchScreenNavigationProp>();
  const theme = useTheme();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const data = await getPlayers();
      setPlayers(data);
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los jugadores');
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPlayer1 || !selectedPlayer2) {
      setSubmitStatus('error');
      return;
    }

    if (selectedPlayer1 === selectedPlayer2) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await addMatch(
        selectedPlayer1,
        selectedPlayer2,
        player1Result,
        player2Result
      );

      setSubmitStatus('success');
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <View style={styles.header}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            icon={({ size, color }) => (
              <MaterialCommunityIcons name="arrow-left" size={size} color={color} />
            )}
          >
            Volver
          </Button>
        <Text style={styles.title}>Registrar Nueva Partida</Text>
        </View>

        <View style={styles.playerSection}>
          <Text style={styles.sectionTitle}>
            <MaterialCommunityIcons name="account" size={20} color={theme.colors.primary} /> Jugador 1
          </Text>
          {players.map(player => (
            <Button
              key={player.id}
              mode={selectedPlayer1 === player.id ? 'contained' : 'outlined'}
              onPress={() => setSelectedPlayer1(player.id)}
              style={styles.playerButton}
              icon={({ size, color }) => (
                <MaterialCommunityIcons name="account-circle" size={size} color={color} />
              )}
            >
              {player.name}
            </Button>
          ))}
        </View>

        <View style={styles.playerSection}>
          <Text style={styles.sectionTitle}>
            <MaterialCommunityIcons name="account" size={20} color={theme.colors.primary} /> Jugador 2
          </Text>
          {players.map(player => (
            <Button
              key={player.id}
              mode={selectedPlayer2 === player.id ? 'contained' : 'outlined'}
              onPress={() => setSelectedPlayer2(player.id)}
              style={styles.playerButton}
              icon={({ size, color }) => (
                <MaterialCommunityIcons name="account-circle" size={size} color={color} />
              )}
            >
              {player.name}
            </Button>
          ))}
        </View>

        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>
            <MaterialCommunityIcons name="trophy" size={20} color={theme.colors.primary} /> Resultado
          </Text>
          <View style={styles.resultButtons}>
            <Button
              mode={player1Result === 'win' ? 'contained' : 'outlined'}
              onPress={() => {
                setPlayer1Result('win');
                setPlayer2Result('lose');
              }}
              style={styles.resultButton}
              icon={({ size, color }) => (
                <MaterialCommunityIcons name="trophy-variant" size={size} color={color} />
              )}
            >
              Jugador 1 Gana
            </Button>
            <Button
              mode={player2Result === 'win' ? 'contained' : 'outlined'}
              onPress={() => {
                setPlayer1Result('lose');
                setPlayer2Result('win');
              }}
              style={styles.resultButton}
              icon={({ size, color }) => (
                <MaterialCommunityIcons name="trophy-variant" size={size} color={color} />
              )}
            >
              Jugador 2 Gana
            </Button>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={[
            styles.submitButton,
            submitStatus === 'success' && styles.successButton,
            submitStatus === 'error' && styles.errorButton
          ]}
          loading={isSubmitting}
          disabled={isSubmitting}
          icon={({ size, color }) => {
            if (submitStatus === 'success') {
              return <MaterialCommunityIcons name="check-circle" size={size} color={color} />;
            } else if (submitStatus === 'error') {
              return <MaterialCommunityIcons name="alert-circle" size={size} color={color} />;
            }
            return <MaterialCommunityIcons name="check-circle" size={size} color={color} />;
          }}
        >
          {isSubmitting ? 'Registrando...' : 
           submitStatus === 'success' ? '¡Partida Registrada!' :
           submitStatus === 'error' ? 'Error al Registrar' :
           'Registrar Partida'}
        </Button>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  surface: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  playerSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerButton: {
    marginBottom: 8,
  },
  resultSection: {
    marginBottom: 24,
  },
  resultButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  submitButton: {
    marginTop: 16,
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  errorButton: {
    backgroundColor: '#f44336',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddMatchScreen;
