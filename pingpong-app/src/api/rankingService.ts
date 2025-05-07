import { api } from './api';
import axios from 'axios';

export interface Ranking {
  id_rankings: number;
  id_torneo: number;
  id_jugador: number;
  posicion: number;
  partidas_ganadas: number;
  partidas_perdidas: number;
  nombre_jugador?: string; // Para cuando necesitemos mostrar el nombre del jugador
  nombre_torneo?: string; // Para cuando necesitemos mostrar el nombre del torneo
  total_partidas?: number;
  porcentaje_victorias?: number;
}

class RankingService {
  async getTournamentRankings(tournamentId: number): Promise<Ranking[]> {
    try {
      console.log('🚀 Obteniendo rankings para torneo:', tournamentId);
      const response = await api.get(`/rankings/torneo/${tournamentId}`);
      console.log('✅ Rankings obtenidos:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener rankings del torneo:', error);
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

  async getPlayerRankings(playerId: number): Promise<Ranking[]> {
    try {
      console.log('🚀 Obteniendo rankings para jugador:', playerId);
      const response = await api.get(`/rankings/jugador/${playerId}`);
      console.log('✅ Rankings obtenidos:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener rankings del jugador:', error);
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

  async createRanking(ranking: Omit<Ranking, 'id_rankings'>): Promise<Ranking> {
    try {
      console.log('🚀 Creando nuevo ranking:', ranking);
      const response = await api.post('/rankings', ranking);
      console.log('✅ Ranking creado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear ranking:', error);
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

  async updateRanking(id: number, ranking: Partial<Ranking>): Promise<Ranking> {
    try {
      console.log('🚀 Actualizando ranking:', { id, ranking });
      const response = await api.put(`/rankings/${id}`, ranking);
      console.log('✅ Ranking actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar ranking:', error);
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

  async deleteRanking(id: number): Promise<void> {
    try {
      console.log('🚀 Eliminando ranking:', id);
      await api.delete(`/rankings/${id}`);
      console.log('✅ Ranking eliminado correctamente');
    } catch (error) {
      console.error('❌ Error al eliminar ranking:', error);
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
}

export const rankingService = new RankingService(); 