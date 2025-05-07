import { API_URL } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: number;
  username: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    console.log('🔄 Inicializando AuthService');
    this.loadAuthData();
  }

  private async loadAuthData() {
    try {
      console.log('🔄 Cargando datos de autenticación...');
      const [token, userStr] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user')
      ]);
      
      console.log('🔑 Token cargado:', token ? 'Sí' : 'No');
      
      // Verificar si el token existe y no ha expirado
      if (token) {
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const expirationTime = tokenData.exp * 1000; // Convertir a milisegundos
          
          if (Date.now() >= expirationTime) {
            console.log('⚠️ Token expirado, limpiando datos...');
            await this.logout();
            return;
          }
        } catch (error) {
          console.error('❌ Error al verificar token:', error);
          await this.logout();
          return;
        }
      }
      
      this.token = token;
      if (userStr) {
        this.user = JSON.parse(userStr);
        console.log('👤 Usuario cargado:', this.user?.username || 'No disponible');
      }
    } catch (error) {
      console.error('❌ Error al cargar datos de autenticación:', error);
      await this.logout();
    }
  }

  async register(username: string, password: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al registrar usuario');
    }
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    console.log('🔄 Iniciando login para:', username);
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error en login:', error);
      throw new Error(error.error || 'Error al iniciar sesión');
    }

    const data = await response.json();
    console.log('✅ Login exitoso, guardando datos...');
    await this.setAuthData(data);
    return data;
  }

  async logout(): Promise<void> {
    this.token = null;
    this.user = null;
    await AsyncStorage.multiRemove(['token', 'user']);
  }

  private async setAuthData(data: AuthResponse): Promise<void> {
    console.log('🔄 Guardando datos de autenticación...');
    this.token = data.token;
    this.user = data.user;
    try {
      await AsyncStorage.multiSet([
        ['token', data.token],
        ['user', JSON.stringify(data.user)]
      ]);
      console.log('✅ Datos guardados correctamente');
      console.log('🔑 Token guardado:', this.token ? 'Sí' : 'No');
      console.log('👤 Usuario guardado:', this.user?.username);
    } catch (error) {
      console.error('❌ Error al guardar datos:', error);
      throw error;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  isAdmin(): boolean {
    return this.user?.role === 'admin';
  }
}

export const authService = new AuthService(); 