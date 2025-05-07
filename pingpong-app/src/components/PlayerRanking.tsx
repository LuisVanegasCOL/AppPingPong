import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Surface, Text, useTheme, DataTable } from 'react-native-paper';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryBar } from 'victory-native';
import moment from 'moment';
import 'moment/locale/es';
import { useApp } from '../context/AppContext';

moment.locale('es');

interface Player {
  id: number;
  name: string;
  victories: number;
  photoUrl?: string;
}

interface Match {
  id: number;
  player1_id: number;
  player2_id: number;
  player1_result: string;
  player2_result: string;
  match_date: string;
}

interface PlayerRankingProps {
  players: Player[];
  matches: Match[];
}

export const PlayerRanking: React.FC<PlayerRankingProps> = ({ players, matches }) => {
  const { theme } = useApp();
  const screenWidth = Dimensions.get('window').width;

  // Calcular victorias por mes para cada jugador
  const getMonthlyStats = () => {
    const monthlyStats = new Map<string, Map<number, number>>();
    
    matches.forEach(match => {
      const month = moment(match.match_date).format('YYYY-MM');
      if (!monthlyStats.has(month)) {
        monthlyStats.set(month, new Map());
      }
      
      const playerStats = monthlyStats.get(month)!;
      if (match.player1_result === 'win') {
        playerStats.set(match.player1_id, (playerStats.get(match.player1_id) || 0) + 1);
      }
      if (match.player2_result === 'win') {
        playerStats.set(match.player2_id, (playerStats.get(match.player2_id) || 0) + 1);
      }
    });

    return monthlyStats;
  };

  // Obtener el ranking mensual
  const getMonthlyRanking = () => {
    const monthlyStats = getMonthlyStats();
    const months = Array.from(monthlyStats.keys()).sort();
    
    return months.map(month => {
      const stats = monthlyStats.get(month)!;
      const ranking = players
        .map(player => ({
          ...player,
          monthlyVictories: stats.get(player.id) || 0
        }))
        .sort((a, b) => b.monthlyVictories - a.monthlyVictories);
      
      return { month, ranking };
    });
  };

  const monthlyRanking = getMonthlyRanking();

  return (
    <ScrollView>
      <Surface style={[styles.container, { backgroundColor: theme.colors.background }]} elevation={2}>
        <Text variant="titleLarge" style={styles.title}>Ranking Histórico</Text>

        {monthlyRanking.map(({ month, ranking }) => (
          <Surface key={month} style={styles.monthContainer} elevation={1}>
            <Text variant="titleMedium" style={styles.monthTitle}>
              {moment(month).format('MMMM YYYY')}
            </Text>

            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Pos.</DataTable.Title>
                <DataTable.Title>Jugador</DataTable.Title>
                <DataTable.Title numeric>Victorias</DataTable.Title>
              </DataTable.Header>

              {ranking.map((player, index) => (
                <DataTable.Row key={player.id}>
                  <DataTable.Cell>{index + 1}º</DataTable.Cell>
                  <DataTable.Cell>{player.name}</DataTable.Cell>
                  <DataTable.Cell numeric>{player.monthlyVictories}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>

            <VictoryChart
              theme={VictoryTheme.material}
              width={screenWidth - 48}
              height={200}
              padding={{ top: 20, bottom: 40, left: 60, right: 40 }}
            >
              <VictoryBar
                data={ranking.slice(0, 5)}
                x="name"
                y="monthlyVictories"
                style={{
                  data: { fill: theme.colors.primary }
                }}
              />
              <VictoryAxis
                style={{
                  axis: { stroke: theme.colors.onSurface },
                  tickLabels: { 
                    fill: theme.colors.onSurface,
                    angle: -45,
                    textAnchor: 'end'
                  }
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: theme.colors.onSurface },
                  tickLabels: { fill: theme.colors.onSurface }
                }}
              />
            </VictoryChart>
          </Surface>
        ))}
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  monthContainer: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
  },
  monthTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
}); 