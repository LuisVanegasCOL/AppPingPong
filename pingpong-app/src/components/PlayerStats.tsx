import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native';
import { useApp } from '../context/AppContext';
import moment from 'moment';
import 'moment/locale/es';
import { Footer } from './Footer';

moment.locale('es');

interface PlayerStatsProps {
  player: {
    id: number;
    name: string;
    victories: number;
  };
  matchHistory: Array<{
    date: string;
    result: 'win' | 'loss';
  }>;
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({ player, matchHistory }) => {
  const { theme } = useApp();

  const victoryData = matchHistory.reduce((acc: { x: Date; y: number }[], match, index) => {
    const victories = match.result === 'win' ? 
      (acc[index - 1]?.y || 0) + 1 : 
      (acc[index - 1]?.y || 0);
    
    return [...acc, { 
      x: new Date(match.date), 
      y: victories 
    }];
  }, []);

  const monthlyStats = matchHistory.reduce((acc: Record<string, { wins: number; total: number }>, match) => {
    const month = moment(match.date).format('YYYY-MM');
    if (!acc[month]) {
      acc[month] = { wins: 0, total: 0 };
    }
    acc[month].total += 1;
    if (match.result === 'win') {
      acc[month].wins += 1;
    }
    return acc;
  }, {});

  const winRate = matchHistory.length > 0 
    ? (matchHistory.filter(m => m.result === 'win').length / matchHistory.length * 100).toFixed(1)
    : '0';

  const currentStreak = matchHistory
    .reverse()
    .reduce((streak, match) => {
      if (match.result === 'win' && streak.isWinning) {
        return { count: streak.count + 1, isWinning: true };
      }
      return { count: 0, isWinning: match.result === 'win' };
    }, { count: 0, isWinning: true }).count;

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]} elevation={2}>
      <Text variant="titleLarge" style={styles.title}>Estadísticas de {player.name}</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text variant="headlineMedium">{player.victories}</Text>
          <Text variant="bodyMedium">Victorias Totales</Text>
        </View>
        <View style={styles.statItem}>
          <Text variant="headlineMedium">{winRate}%</Text>
          <Text variant="bodyMedium">Porcentaje Victoria</Text>
        </View>
        <View style={styles.statItem}>
          <Text variant="headlineMedium">{currentStreak}</Text>
          <Text variant="bodyMedium">Racha Actual</Text>
        </View>
      </View>

      <Text variant="titleMedium" style={styles.subtitle}>Progreso de Victorias</Text>
      <Surface style={styles.chartContainer} elevation={1}>
        <VictoryChart
          theme={VictoryTheme.material}
          width={Dimensions.get('window').width - 64}
          height={200}
        >
          <VictoryAxis
            tickFormat={(date: Date) => moment(date).format('DD/MM')}
            style={{
              axis: { stroke: theme.colors.onSurface },
              tickLabels: { fill: theme.colors.onSurface },
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: theme.colors.onSurface },
              tickLabels: { fill: theme.colors.onSurface },
            }}
          />
          <VictoryLine
            data={victoryData}
            style={{
              data: { stroke: theme.colors.primary },
            }}
          />
        </VictoryChart>
      </Surface>

      <Text variant="titleMedium" style={styles.subtitle}>Estadísticas Mensuales</Text>
      <View style={styles.monthlyStats}>
        {Object.entries(monthlyStats).map(([month, stats]) => (
          <Surface key={month} style={styles.monthStat} elevation={1}>
            <Text variant="titleSmall">{moment(month).format('MMMM YYYY')}</Text>
            <Text variant="bodyMedium">
              {stats.wins} victorias de {stats.total} partidos
            </Text>
            <Text variant="bodySmall">
              ({((stats.wins / stats.total) * 100).toFixed(1)}% efectividad)
            </Text>
          </Surface>
        ))}
      </View>

      <Footer />
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  chartContainer: {
    padding: 8,
    borderRadius: 8,
  },
  monthlyStats: {
    marginTop: 8,
  },
  monthStat: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
}); 