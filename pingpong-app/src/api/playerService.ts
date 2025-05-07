import { api } from './api';
import { authService } from './authService';
import axios from 'axios';

export interface Player {
  id: number;
  name: string;
  victories: number;
  stats_wins: number;
  stats_losses: number;
  stats_draws: number;
}

export const playerService = {
  getPlayers: async (): Promise<Player[]> => {
    try {
      console.log('🚀 Iniciando solicitud GET a /players');
      console.log('📡 URL base:', api.defaults.baseURL);
      const response = await api.get('/players');
      console.log('✅ Respuesta del servidor:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener jugadores:', error);
      if (axios.isAxiosError(error)) {
        console.error('Detalles del error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
      }
      throw error;
    }
  },

  createPlayer: async (player: { name: string }): Promise<Player> => {
    try {
      const response = await api.post('/players', player);
      return response.data;
    } catch (error) {
      console.error('Error al crear jugador:', error);
      throw error;
    }
  },

  updatePlayer: async (id: number, player: { name: string }): Promise<Player> => {
    try {
      const response = await api.put(`/players/${id}`, player);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar jugador:', error);
      throw error;
    }
  },

  deletePlayer: async (id: number): Promise<void> => {
    try {
      await api.delete(`/players/${id}`);
    } catch (error) {
      console.error('Error al eliminar jugador:', error);
      throw error;
    }
  },

  addVictory: async (id: number): Promise<void> => {
    try {
      await api.post(`/players/${id}/victory`);
    } catch (error) {
      console.error('Error al registrar victoria:', error);
      throw error;
    }
  }
}; 