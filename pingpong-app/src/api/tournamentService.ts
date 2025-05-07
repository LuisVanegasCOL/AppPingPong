import { api } from './api';
import axios from 'axios';

export interface Tournament {
  id_torneo: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
}

class TournamentService {
  async getAllTournaments(): Promise<Tournament[]> {
    try {
      console.log('🚀 Iniciando solicitud GET a /torneos');
      console.log('📡 URL base:', api.defaults.baseURL);
      const response = await api.get('/torneos');
      console.log('✅ Respuesta del servidor:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener torneos:', error);
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
  }

  async getTournament(id: number): Promise<Tournament> {
    try {
      const response = await api.get(`/torneos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener torneo:', error);
      throw error;
    }
  }

  async createTournament(tournament: Omit<Tournament, 'id_torneo'>): Promise<Tournament> {
    try {
      const response = await api.post('/torneos', tournament);
      return response.data;
    } catch (error) {
      console.error('Error al crear torneo:', error);
      throw error;
    }
  }

  async updateTournament(id: number, tournament: Partial<Tournament>): Promise<Tournament> {
    try {
      const response = await api.put(`/torneos/${id}`, tournament);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar torneo:', error);
      throw error;
    }
  }

  async deleteTournament(id: number): Promise<void> {
    try {
      await api.delete(`/torneos/${id}`);
    } catch (error) {
      console.error('Error al eliminar torneo:', error);
      throw error;
    }
  }
}

export const tournamentService = new TournamentService(); 