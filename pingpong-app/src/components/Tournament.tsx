import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Animated, Share, Easing } from 'react-native';
import { Surface, Text, Button, IconButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface Player {
  id: number;
  name: string;
  photoUrl?: string;
}

interface Match {
  id: number;
  player1?: Player;
  player2?: Player;
  winner?: Player;
  loser?: Player;
  round: number;
  position: number;
  bracket: 'winners' | 'losers' | 'final';
  isComplete: boolean;
}

interface TournamentProps {
  players: Player[];
  onMatchComplete: (matchId: number, winnerId: number) => void;
}

export const Tournament: React.FC<TournamentProps> = ({ players, onMatchComplete }) => {
  const { theme } = useApp();
  const [matches, setMatches] = useState<Match[]>(() => generateDoubleEliminationBrackets(players));
  const [animations] = useState(() => new Map<number, Animated.Value>());
  const [winnerAnimation] = useState(new Animated.Value(0));
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);

  useEffect(() => {
    matches.forEach(match => {
      if (!animations.has(match.id)) {
        animations.set(match.id, new Animated.Value(0));
      }
    });
  }, [matches]);

  function generateDoubleEliminationBrackets(players: Player[]): Match[] {
    const matches: Match[] = [];
    let matchId = 0;

    // Primera ronda (todos los jugadores)
    const matchesInFirstRound = Math.ceil(players.length / 2);
    for (let i = 0; i < matchesInFirstRound; i++) {
      const player1 = players[i * 2];
      const player2 = players[i * 2 + 1];
      
      matches.push({
        id: matchId++,
        player1,
        player2,
        round: 1,
        position: i,
        bracket: 'winners',
        isComplete: false
      });
    }

    return matches;
  }

  const handleWinnerSelection = async (match: Match, winner: Player, loser: Player) => {
    setCurrentMatch(match);
    
    // Actualizar el partido
    const updatedMatches = matches.map(m => 
      m.id === match.id 
        ? { ...m, winner, loser, isComplete: true }
        : m
    );

    // Verificar si necesitamos crear nuevos partidos
    const currentRound = match.round;
    const currentBracket = match.bracket;
    const currentRoundMatches = updatedMatches.filter(m => m.round === currentRound && m.bracket === currentBracket);
    const allCurrentRoundMatchesComplete = currentRoundMatches.every(m => m.isComplete);

    if (allCurrentRoundMatchesComplete) {
      if (currentBracket === 'winners') {
        if (currentRound === 1) {
          // Crear semifinal de ganadores
          const winners = currentRoundMatches
            .map(m => m.winner)
            .filter((player): player is Player => player !== undefined);

          if (winners.length >= 2) {
            updatedMatches.push({
              id: Math.max(...updatedMatches.map(m => m.id)) + 1,
              player1: winners[0],
              player2: winners[1],
              round: 2,
              position: 0,
              bracket: 'winners',
              isComplete: false
            });

            // Crear semifinal de perdedores
            const losers = currentRoundMatches
              .map(m => m.loser)
              .filter((player): player is Player => player !== undefined);

            if (losers.length >= 2) {
              updatedMatches.push({
                id: Math.max(...updatedMatches.map(m => m.id)) + 1,
                player1: losers[0],
                player2: losers[1],
                round: 2,
                position: 0,
                bracket: 'losers',
                isComplete: false
              });
            }
          }
        } else if (currentRound === 2) {
          // Crear partido entre perdedor de semifinal de ganadores y ganador de semifinal de perdedores
          const winnersSemifinal = updatedMatches.find(m => m.round === 2 && m.bracket === 'winners');
          const losersSemifinal = updatedMatches.find(m => m.round === 2 && m.bracket === 'losers');

          if (winnersSemifinal?.loser && losersSemifinal?.winner) {
            updatedMatches.push({
              id: Math.max(...updatedMatches.map(m => m.id)) + 1,
              player1: winnersSemifinal.loser,
              player2: losersSemifinal.winner,
              round: 3,
              position: 0,
              bracket: 'final',
              isComplete: false
            });
          }
        }
      } else if (currentBracket === 'losers' && currentRound === 2) {
        // Crear partido entre perdedor de semifinal de ganadores y ganador de semifinal de perdedores
        const winnersSemifinal = updatedMatches.find(m => m.round === 2 && m.bracket === 'winners');
        const losersSemifinal = updatedMatches.find(m => m.round === 2 && m.bracket === 'losers');

        if (winnersSemifinal?.loser && losersSemifinal?.winner) {
          updatedMatches.push({
            id: Math.max(...updatedMatches.map(m => m.id)) + 1,
            player1: winnersSemifinal.loser,
            player2: losersSemifinal.winner,
            round: 3,
            position: 0,
            bracket: 'final',
            isComplete: false
          });
        }
      } else if (currentBracket === 'final' && currentRound === 3) {
        // Crear la gran final
        const winnersSemifinal = updatedMatches.find(m => m.round === 2 && m.bracket === 'winners');
        const finalMatch = updatedMatches.find(m => m.round === 3 && m.bracket === 'final');

        if (winnersSemifinal?.winner && finalMatch?.winner) {
          updatedMatches.push({
            id: Math.max(...updatedMatches.map(m => m.id)) + 1,
            player1: winnersSemifinal.winner,
            player2: finalMatch.winner,
            round: 4,
            position: 0,
            bracket: 'final',
            isComplete: false
          });
        }
      }
    }

    setMatches(updatedMatches);
    onMatchComplete(match.id, winner.id);

    // Animar la victoria
    Animated.sequence([
      Animated.timing(winnerAnimation, {
        toValue: 1,
        duration: 300,
        easing: Easing.bounce,
        useNativeDriver: true
      }),
      Animated.delay(200),
      Animated.timing(winnerAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      setCurrentMatch(null);
    });
  };

  const renderMatch = (match: Match) => {
    const animation = animations.get(match.id);
    const scale = animation?.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.1]
    }) || 1;

    const winnerScale = winnerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.5]
    });

    const isCurrentMatch = currentMatch?.id === match.id;
    const isWinner = match.winner && isCurrentMatch;

    return (
      <Animated.View 
        key={match.id} 
        style={[
          styles.matchContainer,
          { transform: [{ scale: isWinner ? winnerScale : scale }] }
        ]}
      >
        <Surface 
          style={[
            styles.matchSurface,
            { 
              backgroundColor: theme.colors.surface,
              borderColor: isWinner ? theme.colors.primary : 'transparent',
              borderWidth: isWinner ? 2 : 0
            }
          ]} 
          elevation={isWinner ? 4 : 2}
        >
          <View style={styles.playerContainer}>
            <View style={styles.playerInfo}>
              <Text 
                variant="titleMedium"
                style={[
                  styles.playerName,
                  match.winner?.id === match.player1?.id && styles.winner
                ]}
              >
                {match.player1?.name || 'Por definir'}
              </Text>
            </View>
            {!match.isComplete && match.player1 && match.player2 && (
              <Button
                mode="contained"
                onPress={() => handleWinnerSelection(match, match.player1!, match.player2!)}
                disabled={isCurrentMatch}
                compact
              >
                Ganó
              </Button>
            )}
          </View>

          <View style={styles.vsContainer}>
            <MaterialCommunityIcons 
              name="table-tennis" 
              size={24} 
              color={theme.colors.primary} 
            />
          </View>

          <View style={styles.playerContainer}>
            <View style={styles.playerInfo}>
              <Text 
                variant="titleMedium"
                style={[
                  styles.playerName,
                  match.winner?.id === match.player2?.id && styles.winner
                ]}
              >
                {match.player2?.name || 'Por definir'}
              </Text>
            </View>
            {!match.isComplete && match.player1 && match.player2 && (
              <Button
                mode="contained"
                onPress={() => handleWinnerSelection(match, match.player2!, match.player1!)}
                disabled={isCurrentMatch}
                compact
              >
                Ganó
              </Button>
            )}
          </View>
        </Surface>
      </Animated.View>
    );
  };

  const renderBracket = () => {
    const rounds = Math.max(...matches.map(m => m.round));
    const winnersMatches = matches.filter(m => m.bracket === 'winners');
    const losersMatches = matches.filter(m => m.bracket === 'losers');
    const finalMatches = matches.filter(m => m.bracket === 'final');

    return (
      <View style={styles.bracketSection}>
        <View style={styles.bracketContainer}>
          {/* Ronda de ganadores */}
          <View style={styles.roundContainer}>
            <Text variant="titleMedium" style={styles.roundTitle}>
              Primera Ronda
            </Text>
            {winnersMatches.filter(m => m.round === 1).map(renderMatch)}
          </View>

          {/* Semifinales */}
          <View style={styles.roundContainer}>
            <Text variant="titleMedium" style={styles.roundTitle}>
              Semifinales
            </Text>
            <View style={styles.semifinalsContainer}>
              <View style={styles.semifinalSection}>
                <Text variant="titleSmall" style={styles.semifinalTitle}>Grupo 1</Text>
                {winnersMatches.filter(m => m.round === 2).map(renderMatch)}
              </View>
              <View style={styles.semifinalSection}>
                <Text variant="titleSmall" style={styles.semifinalTitle}>Grupo 2</Text>
                {losersMatches.filter(m => m.round === 2).map(renderMatch)}
              </View>
            </View>
          </View>

          {/* Final */}
          <View style={styles.roundContainer}>
            <Text variant="titleMedium" style={styles.roundTitle}>
              Semifinal de Perdedores
            </Text>
            {finalMatches.filter(m => m.round === 3).map(renderMatch)}
          </View>

          {/* Gran Final */}
          {finalMatches.some(m => m.round === 4) && (
            <View style={styles.roundContainer}>
              <Text variant="titleMedium" style={styles.roundTitle}>
                Gran Final
              </Text>
              {finalMatches.filter(m => m.round === 4).map(renderMatch)}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Torneo</Text>
      </View>
      <ScrollView horizontal style={styles.scrollContainer}>
        <View style={styles.tournamentContainer}>
          {renderBracket()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  tournamentContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  bracketSection: {
    marginRight: 32,
  },
  bracketContainer: {
    flexDirection: 'row',
  },
  roundContainer: {
    marginRight: 24,
    minWidth: 280,
  },
  roundTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  matchContainer: {
    marginBottom: 16,
  },
  matchSurface: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  playerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 8,
  },
  playerName: {
    flex: 1,
  },
  score: {
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 18,
  },
  vsContainer: {
    alignItems: 'center',
    padding: 4,
  },
  winner: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  semifinalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  semifinalSection: {
    flex: 1,
  },
  semifinalTitle: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
}); 