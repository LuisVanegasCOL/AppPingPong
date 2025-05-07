import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { rankingService, Ranking } from '../api/rankingService';
import { tournamentService, Tournament } from '../api/tournamentService';
import { playerService } from '../api/playerService';

export default function RankingScreen() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedTournament, setSelectedTournament] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [showTournamentSelector, setShowTournamentSelector] = useState(false);
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);
  const [newRanking, setNewRanking] = useState({
    id_torneo: 0,
    id_jugador: 0,
    partidas_ganadas: 0,
    partidas_perdidas: 0
  });

  useEffect(() => {
    fetchTournaments();
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchRankings(selectedTournament);
    }
  }, [selectedTournament]);

  const fetchTournaments = async () => {
    try {
      const data = await tournamentService.getAllTournaments();
      setTournaments(data);
      if (data.length > 0) {
        setSelectedTournament(data[0].id_torneo);
      }
    } catch (error) {
      console.error('Error al obtener torneos:', error);
      Alert.alert('Error', 'No se pudieron cargar los torneos');
    }
  };

  const fetchPlayers = async () => {
    try {
      const data = await playerService.getPlayers();
      setPlayers(data);
    } catch (error) {
      console.error('Error al obtener jugadores:', error);
      Alert.alert('Error', 'No se pudieron cargar los jugadores');
    }
  };

  const fetchRankings = async (tournamentId: number) => {
    try {
      setLoading(true);
      const data = await rankingService.getTournamentRankings(tournamentId);
      setRankings(data);
    } catch (error) {
      console.error('Error al obtener rankings:', error);
      Alert.alert('Error', 'No se pudieron cargar los rankings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRanking = async () => {
    try {
      if (!newRanking.id_torneo || !newRanking.id_jugador) {
        Alert.alert('Error', 'Por favor selecciona un torneo y un jugador');
        return;
      }

      const rankingData = {
        ...newRanking,
        posicion: 0 // La posición se calculará automáticamente en el backend
      };

      await rankingService.createRanking(rankingData);
      setModalVisible(false);
      setNewRanking({
        id_torneo: 0,
        id_jugador: 0,
        partidas_ganadas: 0,
        partidas_perdidas: 0
      });
      fetchRankings(newRanking.id_torneo);
      Alert.alert('Éxito', 'Ranking creado correctamente');
    } catch (error) {
      console.error('Error al crear ranking:', error);
      Alert.alert('Error', 'No se pudo crear el ranking');
    }
  };

  const renderRankingCard = ({ item }: { item: Ranking }) => (
    <View style={styles.card}>
      <View style={styles.positionContainer}>
        <Text style={styles.position}>{item.posicion}°</Text>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.playerName}>{item.nombre_jugador}</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.stats}>G: {item.partidas_ganadas} | P: {item.partidas_perdidas}</Text>
          <Text style={styles.percentage}>{item.porcentaje_victorias}% victorias</Text>
        </View>
      </View>
    </View>
  );

  const renderTournamentSelector = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showTournamentSelector}
      onRequestClose={() => setShowTournamentSelector(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Seleccionar Torneo</Text>
          <ScrollView style={styles.selectorList}>
            {tournaments.map((tournament) => (
              <TouchableOpacity
                key={tournament.id_torneo}
                style={styles.selectorItem}
                onPress={() => {
                  setSelectedTournament(tournament.id_torneo);
                  setShowTournamentSelector(false);
                }}
              >
                <Text style={styles.selectorItemText}>{tournament.nombre}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setShowTournamentSelector(false)}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderPlayerSelector = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showPlayerSelector}
      onRequestClose={() => setShowPlayerSelector(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Seleccionar Jugador</Text>
          <ScrollView style={styles.selectorList}>
            {players.map((player) => (
              <TouchableOpacity
                key={player.id}
                style={styles.selectorItem}
                onPress={() => {
                  setNewRanking({...newRanking, id_jugador: player.id});
                  setShowPlayerSelector(false);
                }}
              >
                <Text style={styles.selectorItemText}>{player.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setShowPlayerSelector(false)}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rankings</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Agregar Ranking</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tournamentSelector}>
        <Text style={styles.selectorLabel}>Seleccionar Torneo:</Text>
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => setShowTournamentSelector(true)}
        >
          <Text style={styles.selectorButtonText}>
            {selectedTournament ? tournaments.find(t => t.id_torneo === selectedTournament)?.nombre : 'Seleccionar torneo'}
          </Text>
        </TouchableOpacity>
      </View>

      {renderTournamentSelector()}
      {renderPlayerSelector()}

      {loading ? (
        <Text style={styles.loadingText}>Cargando rankings...</Text>
      ) : rankings.length === 0 ? (
        <Text style={styles.emptyText}>No hay rankings disponibles</Text>
      ) : (
        <FlatList
          data={rankings}
          renderItem={renderRankingCard}
          keyExtractor={(item) => item.id_rankings.toString()}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Nuevo Ranking</Text>
            
            <Text style={styles.selectorLabel}>Torneo:</Text>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => {
                setModalVisible(false);
                setShowTournamentSelector(true);
              }}
            >
              <Text style={styles.selectorButtonText}>
                {newRanking.id_torneo ? tournaments.find(t => t.id_torneo === newRanking.id_torneo)?.nombre : 'Seleccionar torneo'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.selectorLabel}>Jugador:</Text>
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => {
                setModalVisible(false);
                setShowPlayerSelector(true);
              }}
            >
              <Text style={styles.selectorButtonText}>
                {newRanking.id_jugador ? players.find(p => p.id === newRanking.id_jugador)?.name : 'Seleccionar jugador'}
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Partidas ganadas"
              keyboardType="numeric"
              value={newRanking.partidas_ganadas.toString()}
              onChangeText={(text) => setNewRanking({...newRanking, partidas_ganadas: parseInt(text) || 0})}
            />

            <TextInput
              style={styles.input}
              placeholder="Partidas perdidas"
              keyboardType="numeric"
              value={newRanking.partidas_perdidas.toString()}
              onChangeText={(text) => setNewRanking({...newRanking, partidas_perdidas: parseInt(text) || 0})}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateRanking}
              >
                <Text style={styles.buttonText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tournamentSelector: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  selectorLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  selectorButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  selectorButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectorList: {
    maxHeight: 300,
  },
  selectorItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  selectorItemText: {
    fontSize: 16,
    color: '#333',
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  positionContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  position: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailsContainer: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stats: {
    fontSize: 14,
    color: '#666',
  },
  percentage: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
  },
  createButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 