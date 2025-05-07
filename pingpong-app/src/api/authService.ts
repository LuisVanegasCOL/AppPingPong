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
  private token: string = 'dummy-token';
  private user: User = {
    id: 1,
    username: 'admin',
    role: 'admin'
  };

  constructor() {
    console.log('🔄 Inicializando AuthService');
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
    return {
      token: this.token,
      user: this.user
    };
  }

  async logout(): Promise<void> {
    // No hacer nada
  }

  getToken(): string {
    return this.token;
  }

  getUser(): User {
    return this.user;
  }

  isAuthenticated(): boolean {
    return true;
  }

  isAdmin(): boolean {
    return true;
  }
}

export const authService = new AuthService(); 