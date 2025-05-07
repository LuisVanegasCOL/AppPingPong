import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Icon } from './Icon';

export const IconExample: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Icon name="home" size={24} />
        <Text>Inicio</Text>
      </View>
      <View style={styles.row}>
        <Icon name="matches" size={24} />
        <Text>Partidas</Text>
      </View>
      <View style={styles.row}>
        <Icon name="players" size={24} />
        <Text>Jugadores</Text>
      </View>
      <View style={styles.row}>
        <Icon name="tournaments" size={24} />
        <Text>Torneos</Text>
      </View>
      <View style={styles.row}>
        <Icon name="settings" size={24} />
        <Text>Configuración</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
}); 