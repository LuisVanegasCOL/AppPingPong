// src/screens/PlayersScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, ViewStyle, TextStyle, Animated } from 'react-native';
import { Text, Button, Surface, TextInput, useTheme, Portal, Modal, ActivityIndicator, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { playerService, Player } from '../api/playerService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type PlayersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  playerCard: ViewStyle;
  playerInfo: ViewStyle;
  playerDetails: ViewStyle;
  actions: ViewStyle;
  loadingContainer: ViewStyle;
  modalContainer: ViewStyle;
  modalContent: ViewStyle;
  modalTitle: TextStyle;
  modalText: TextStyle;
  modalButtons: ViewStyle;
  modalButton: ViewStyle;
  input: ViewStyle;
  content: ViewStyle;
  addPlayerSection: ViewStyle;
  addButton: ViewStyle;
  topPlayerCard: ViewStyle;
  avatar: ViewStyle;
  nameContainer: ViewStyle;
  crownIcon: ViewStyle;
  victoriesContainer: ViewStyle;
  victoriesText: TextStyle;
  emptyContainer: ViewStyle;
  emptyText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginTop: 8,
  },
  content: {
    flex: 1,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  playerCard: {
    margin: 8,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerDetails: {
    marginLeft: 16,
  },
  addPlayerSection: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  input: {
    marginBottom: 20,
  },
  addButton: {
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  topPlayerCard: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  avatar: {
    marginRight: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crownIcon: {
    marginLeft: 8,
  },
  victoriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  victoriesText: {
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
  },
});

const PlayersScreen = () => {
  const navigation = useNavigation<PlayersScreenNavigationProp>();
  const theme = useTheme();
  const [modalScale] = useState(new Animated.Value(0));

  const [players, setPlayers] = useState<Player[]>([]);
  const [newName, setNewName] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const fetchPlayers = async () => {
    try {
      const data = await playerService.getPlayers();
      setPlayers(data);
    } catch (error) {
      console.error('Error al obtener jugadores:', error);
      Alert.alert('Error', 'No se pudo cargar la lista de jugadores');
    } finally {
      setLoading(false);
    }
  };

  const addPlayer = async () => {
    if (!newName.trim()) {
      Alert.alert('Campo vacío', 'Por favor ingresa un nombre');
      return;
    }

    try {
      await playerService.createPlayer({ name: newName });
      setNewName('');
      fetchPlayers();
    } catch (error) {
      console.error('Error al agregar jugador:', error);
      Alert.alert('Error', 'No se pudo agregar el jugador');
    }
  };

  const handleUpdatePlayer = async () => {
    if (!editingPlayer || !editName.trim()) return;

    try {
      await playerService.updatePlayer(editingPlayer.id, { name: editName });
      Alert.alert('Éxito', 'Jugador actualizado correctamente');
      fetchPlayers();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el jugador');
    } finally {
      setEditingPlayer(null);
      setEditName('');
    }
  };

  const handleDelete = async (player: Player) => {
    setSelectedPlayer(player);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedPlayer) return;
    
    try {
      await playerService.deletePlayer(selectedPlayer.id);
      Alert.alert('Éxito', 'Jugador eliminado correctamente');
      fetchPlayers();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el jugador');
    } finally {
      setDeleteModalVisible(false);
      setSelectedPlayer(null);
    }
  };

  const openModal = () => {
    Animated.spring(modalScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalScale, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setEditingPlayer(null));
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (editingPlayer) {
      openModal();
    }
  }, [editingPlayer]);

  const getTopPlayer = () => {
    if (players.length === 0) return null;
    return players.reduce((prev, current) => 
      (prev.victories > current.victories) ? prev : current
    );
  };

  const renderPlayerCard = ({ item }: { item: Player }) => {
    const isTopPlayer = getTopPlayer()?.id === item.id;
    
    return (
      <Surface 
        style={[
          styles.playerCard,
          isTopPlayer && styles.topPlayerCard
        ]} 
        elevation={isTopPlayer ? 4 : 1}
      >
        <View style={styles.playerInfo}>
          <Avatar.Text 
            size={40} 
            label={item.name.substring(0, 2).toUpperCase()}
            style={[
              styles.avatar,
              isTopPlayer && { backgroundColor: theme.colors.primary }
            ]}
          />
          <View style={styles.playerDetails}>
            <View style={styles.nameContainer}>
              <Text variant="titleMedium">{item.name}</Text>
              {isTopPlayer && (
                <MaterialCommunityIcons 
                  name="crown" 
                  size={20} 
                  color={theme.colors.primary} 
                  style={styles.crownIcon}
                />
              )}
            </View>
            <View style={styles.victoriesContainer}>
              <MaterialCommunityIcons 
                name="trophy" 
                size={16} 
                color={theme.colors.primary} 
              />
              <Text variant="bodySmall" style={styles.victoriesText}>
                {item.victories} victorias
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => {
              setEditingPlayer(item);
              setEditName(item.name);
            }}
            icon={() => <MaterialCommunityIcons name="pencil" size={24} color={theme.colors.primary} />}
            loading={editingPlayer?.id === item.id}
          >
            Editar
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleDelete(item)}
            icon={() => <MaterialCommunityIcons name="delete" size={24} color={theme.colors.error} />}
            textColor={theme.colors.error}
            loading={selectedPlayer?.id === item.id && deleteModalVisible}
          >
            Eliminar
          </Button>
        </View>
      </Surface>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.header} elevation={2}>
        <MaterialCommunityIcons name="account-group" size={48} color={theme.colors.primary} />
        <Text variant="headlineMedium" style={styles.title}>
          Jugadores
        </Text>
      </Surface>

      <Surface style={styles.content} elevation={1}>
        <FlatList
          data={players}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPlayerCard}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="account-off" size={48} color={theme.colors.outline} />
              <Text variant="titleMedium" style={styles.emptyText}>
                No hay jugadores registrados
              </Text>
            </View>
          }
        />

        <Surface style={styles.addPlayerSection} elevation={2}>
          <TextInput
            mode="outlined"
            label="Nombre del jugador"
            value={newName}
            onChangeText={setNewName}
            style={styles.input}
            right={newName ? (
              <TextInput.Icon 
                icon={({ size, color }) => (
                  <MaterialCommunityIcons 
                    name="close" 
                    size={size} 
                    color={color} 
                  />
                )} 
                onPress={() => setNewName('')} 
              />
            ) : undefined}
          />
          <Button
            mode="contained"
            onPress={addPlayer}
            style={styles.addButton}
            icon={() => <MaterialCommunityIcons name="account-plus" size={24} color={theme.colors.onPrimary} />}
          >
            Agregar Jugador
          </Button>
        </Surface>
      </Surface>

      <Portal>
        <Modal
          visible={editingPlayer !== null}
          onDismiss={closeModal}
          style={styles.modalContainer}
        >
          <Animated.View 
            style={[
              styles.modalContent,
              { transform: [{ scale: modalScale }] }
            ]}
          >
            <Text variant="titleLarge" style={styles.modalTitle}>
              Editar Jugador
            </Text>
            <TextInput
              mode="outlined"
              label="Nombre"
              value={editName}
              onChangeText={setEditName}
              style={styles.input}
              left={(
                <TextInput.Icon 
                  icon={({ size, color }) => (
                    <MaterialCommunityIcons 
                      name="account" 
                      size={size} 
                      color={color} 
                    />
                  )} 
                />
              )}
            />
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={closeModal}
                style={styles.modalButton}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdatePlayer}
                style={styles.modalButton}
                loading={loading}
              >
                Guardar
              </Button>
            </View>
          </Animated.View>
        </Modal>
      </Portal>

      <Portal>
        <Modal
          visible={deleteModalVisible}
          onDismiss={() => setDeleteModalVisible(false)}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              ¿Eliminar jugador?
            </Text>
            <Text variant="bodyMedium" style={styles.modalText}>
              ¿Estás seguro de que deseas eliminar a {selectedPlayer?.name}?
            </Text>
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setDeleteModalVisible(false)}
                style={styles.modalButton}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={confirmDelete}
                buttonColor={theme.colors.error}
                style={styles.modalButton}
              >
                Eliminar
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

export default PlayersScreen;
