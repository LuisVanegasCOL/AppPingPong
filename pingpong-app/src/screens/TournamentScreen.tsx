import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { tournamentService } from '../api/tournamentService';
import { Tournament } from '../api/tournamentService';

export default function TournamentScreen() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTournament, setNewTournament] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'activo'
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const data = await tournamentService.getAllTournaments();
      setTournaments(data);
    } catch (error) {
      console.error('Error al obtener torneos:', error);
      Alert.alert('Error', 'No se pudieron cargar los torneos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async () => {
    try {
      if (!newTournament.nombre || !newTournament.fecha_inicio || !newTournament.fecha_fin) {
        Alert.alert('Error', 'Por favor completa todos los campos');
        return;
      }

      await tournamentService.createTournament(newTournament);
      setModalVisible(false);
      setNewTournament({
        nombre: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'activo'
      });
      fetchTournaments();
      Alert.alert('Éxito', 'Torneo creado correctamente');
    } catch (error) {
      console.error('Error al crear torneo:', error);
      Alert.alert('Error', 'No se pudo crear el torneo');
    }
  };

  const renderTournamentCard = ({ item }: { item: Tournament }) => (
    <View style={styles.card}>
      <Text style={styles.tournamentName}>{item.nombre}</Text>
      <View style={styles.datesContainer}>
        <Text style={styles.date}>Inicio: {new Date(item.fecha_inicio).toLocaleDateString()}</Text>
        <Text style={styles.date}>Fin: {new Date(item.fecha_fin).toLocaleDateString()}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: item.estado === 'activo' ? '#4CAF50' : '#9E9E9E' }]}>
        <Text style={styles.statusText}>{item.estado}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Torneos</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Crear Torneo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Cargando torneos...</Text>
      ) : tournaments.length === 0 ? (
        <Text style={styles.emptyText}>No hay torneos disponibles</Text>
      ) : (
        <FlatList
          data={tournaments}
          renderItem={renderTournamentCard}
          keyExtractor={(item) => item.id_torneo.toString()}
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
            <Text style={styles.modalTitle}>Crear Nuevo Torneo</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nombre del torneo"
              value={newTournament.nombre}
              onChangeText={(text) => setNewTournament({...newTournament, nombre: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Fecha de inicio (YYYY-MM-DD)"
              value={newTournament.fecha_inicio}
              onChangeText={(text) => setNewTournament({...newTournament, fecha_inicio: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Fecha de fin (YYYY-MM-DD)"
              value={newTournament.fecha_fin}
              onChangeText={(text) => setNewTournament({...newTournament, fecha_fin: text})}
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
                onPress={handleCreateTournament}
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
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  datesContainer: {
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
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