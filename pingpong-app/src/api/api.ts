import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './authService';

// Configuración de la URL base según la plataforma
export const API_URL = Platform.select({
  android: 'http://10.0.2.2:8080', // Para el emulador de Android
  ios: 'http://localhost:8080',    // Para el simulador de iOS
  default: 'http://localhost:8080' // Para desarrollo web
});

// Crear instancia de axios con la configuración base
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('🔍 Interceptor - Token recuperado:', token ? 'Sí' : 'No');
      
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Interceptor - Token agregado a los headers');
        console.log('🔧 Interceptor - Headers completos:', JSON.stringify(config.headers, null, 2));
      } else {
        console.warn('⚠️ Interceptor - No se encontró token de autenticación');
      }

      console.log('📤 Interceptor - Configuración de la solicitud:', {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL
      });
    } catch (error) {
      console.error('❌ Interceptor - Error al obtener el token:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Interceptor - Error en la configuración:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403) {
      console.log('⚠️ Error 403 detectado, limpiando datos de autenticación...');
      await authService.logout();
      // Redirigir al login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Definir los tipos de las respuestas esperadas
export interface Player {
  id: number;
  name: string;
  victories: number;
}

export interface Match {
  id: number;
  player1_id: number;
  player2_id: number;
  player1_result: string;
  player2_result: string;
  match_date: string;
  winner_id: number;
  player1_name?: string;
  player2_name?: string;
  winner_name?: string;
}

export interface Tournament {
  id_torneo: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
}

export interface Ranking {
  id_rankings: number;
  id_torneo: number;
  id_jugador: number;
  posicion: number;
  partidas_ganadas: number;
  partidas_perdidas: number;
  nombre_jugador?: string;
  nombre_torneo?: string;
}

// Funciones para interactuar con la API
export const getPlayers = async (): Promise<Player[]> => {
  try {
    const response = await api.get('/players');
    return response.data;
  } catch (error) {
    console.error('Error al obtener jugadores:', error);
    throw error;
  }
};

export const addPlayer = async (name: string): Promise<Player> => {
  try {
    const response = await api.post('/players', { name });
    return response.data;
  } catch (error) {
    console.error('Error al agregar jugador:', error);
    throw error;
  }
};

export const addMatch = async (
  player1Id: number,
  player2Id: number,
  player1Result: string,
  player2Result: string
): Promise<Match> => {
  try {
    const requestBody = {
      player1_id: player1Id,
      player2_id: player2Id,
      player1_result: player1Result,
      player2_result: player2Result
    };

    console.log('🚀 Iniciando solicitud POST a /matches');
    console.log('📦 Datos a enviar:', requestBody);
    console.log('🔧 Configuración de la solicitud:', {
      url: api.defaults.baseURL + '/matches',
      headers: api.defaults.headers
    });

    const response = await api.post('/matches', requestBody);
    console.log('✅ Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al agregar partida:', error);
    if (axios.isAxiosError(error)) {
      console.error('Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          baseURL: error.config?.baseURL
        }
      });
    }
    throw error;
  }
};

export const getMatches = async (): Promise<Match[]> => {
  try {
    const response = await api.get('/matches');
    return response.data;
  } catch (error) {
    console.error('Error al obtener partidas:', error);
    throw error;
  }
};

export const deletePlayer = async (id: number): Promise<void> => {
  try {
    console.log('🚀 Iniciando solicitud DELETE a:', `/players/${id}`);
    await api.delete(`/players/${id}`);
    console.log('✅ Jugador eliminado correctamente');
  } catch (error) {
    console.error('Error al eliminar jugador:', error);
    throw error;
  }
};

export const deleteMatch = async (id: number): Promise<void> => {
  try {
    await api.post(`/matches/${id}/delete`);
    console.log('✅ Partida eliminada correctamente');
  } catch (error) {
    console.error('Error al eliminar partida:', error);
    throw error;
  }
};

// Funciones para torneos
export const getTournaments = async (): Promise<Tournament[]> => {
  try {
    const response = await api.get('/torneos');
    return response.data;
  } catch (error) {
    console.error('Error al obtener torneos:', error);
    throw error;
  }
};

export const getTournament = async (id: number): Promise<Tournament> => {
  try {
    const response = await api.get(`/torneos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener torneo:', error);
    throw error;
  }
};

export const addTournament = async (tournament: Omit<Tournament, 'id_torneo'>): Promise<Tournament> => {
  try {
    const response = await api.post('/torneos', tournament);
    return response.data;
  } catch (error) {
    console.error('Error al crear torneo:', error);
    throw error;
  }
};

export const updateTournament = async (id: number, tournament: Partial<Tournament>): Promise<Tournament> => {
  try {
    const response = await api.put(`/torneos/${id}`, tournament);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar torneo:', error);
    throw error;
  }
};

export const deleteTournament = async (id: number): Promise<void> => {
  try {
    await api.delete(`/torneos/${id}`);
    console.log('✅ Torneo eliminado correctamente');
  } catch (error) {
    console.error('Error al eliminar torneo:', error);
    throw error;
  }
};

// Funciones para rankings
export const getTournamentRankings = async (tournamentId: number): Promise<Ranking[]> => {
  try {
    const response = await api.get(`/rankings/torneo/${tournamentId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener rankings del torneo:', error);
    throw error;
  }
};

export const getPlayerRankings = async (playerId: number): Promise<Ranking[]> => {
  try {
    const response = await api.get(`/rankings/jugador/${playerId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener rankings del jugador:', error);
    throw error;
  }
};

export const addRanking = async (ranking: Omit<Ranking, 'id_rankings'>): Promise<Ranking> => {
  try {
    const response = await api.post('/rankings', ranking);
    return response.data;
  } catch (error) {
    console.error('Error al crear ranking:', error);
    throw error;
  }
};

export const updateRanking = async (id: number, ranking: Partial<Ranking>): Promise<Ranking> => {
  try {
    const response = await api.put(`/rankings/${id}`, ranking);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar ranking:', error);
    throw error;
  }
};

export const deleteRanking = async (id: number): Promise<void> => {
  try {
    await api.delete(`/rankings/${id}`);
    console.log('✅ Ranking eliminado correctamente');
  } catch (error) {
    console.error('Error al eliminar ranking:', error);
    throw error;
  }
};
