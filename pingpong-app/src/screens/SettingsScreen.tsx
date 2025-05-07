import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, Switch, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const SettingsScreen = () => {
  const { theme, isOfflineMode, soundEnabled, toggleOfflineMode, toggleSound } = useApp();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.header} elevation={2}>
        <MaterialCommunityIcons name="cog" size={48} color={theme.colors.primary} />
        <Text variant="headlineMedium" style={styles.title}>
          Ajustes
        </Text>
      </Surface>

      <Surface style={styles.section} elevation={1}>
        <View style={styles.settingItem}>
          <MaterialCommunityIcons name="wifi-off" size={24} color={theme.colors.primary} />
          <View style={styles.settingText}>
            <Text variant="titleMedium">Modo sin conexión</Text>
            <Text variant="bodySmall">Usar datos locales sin conexión a internet</Text>
          </View>
          <Switch value={isOfflineMode} onValueChange={toggleOfflineMode} />
        </View>

        <View style={styles.settingItem}>
          <MaterialCommunityIcons name="volume-high" size={24} color={theme.colors.primary} />
          <View style={styles.settingText}>
            <Text variant="titleMedium">Sonido</Text>
            <Text variant="bodySmall">Activar/desactivar efectos de sonido</Text>
          </View>
          <Switch value={soundEnabled} onValueChange={toggleSound} />
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  title: {
    marginTop: 16,
    textAlign: 'center',
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingText: {
    flex: 1,
    marginLeft: 16,
  }
}); 

export default SettingsScreen; 