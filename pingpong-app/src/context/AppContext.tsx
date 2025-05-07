import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3Theme } from 'react-native-paper';
import { CombinedDefaultTheme } from '../theme';
import { API_URL } from '../api/api';
import { authService } from '../api/authService';

interface Player {
  id: number;
  name: string;
  victories: number;
  stats_wins: number;
  stats_losses: number;
  stats_draws: number;
}

interface Match {
  id: number;
  player1: Player;
  player2: Player;
  winner?: Player;
  date: Date;
  comments: Comment[];
}

interface Tournament {
  id: number;
  name: string;
  description: string;
  startDate: Date;
  maxPlayers: number;
  location: string;
  players: Player[];
  matches: Match[];
  status: 'pending' | 'in_progress' | 'completed';
}

interface Comment {
  id: number;
  matchId: number;
  userId: number;
  text: string;
  timestamp: Date;
}

export interface AppContextType {
  theme: MD3Theme;
  isOfflineMode: boolean;
  soundEnabled: boolean;
  toggleOfflineMode: () => void;
  toggleSound: () => void;
  players: Player[];
  matches: Match[];
  tournaments: Tournament[];
  comments: Comment[];
  addPlayer: (player: Omit<Player, 'id' | 'stats'>) => Promise<void>;
  updatePlayer: (player: Player) => Promise<void>;
  addLocalMatch: (match: Omit<Match, 'id' | 'comments'>) => Promise<Match>;
  addComment: (matchId: number, text: string) => Promise<void>;
  createTournament: (tournament: Omit<Tournament, 'id' | 'players' | 'matches' | 'status'>) => Promise<void>;
  updateTournament: (tournament: Tournament) => Promise<void>;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedPlayers = await AsyncStorage.getItem('players');
      const storedMatches = await AsyncStorage.getItem('matches');
      const storedTournaments = await AsyncStorage.getItem('tournaments');
      const storedComments = await AsyncStorage.getItem('comments');
      const storedSoundEnabled = await AsyncStorage.getItem('soundEnabled');

      if (storedPlayers) setPlayers(JSON.parse(storedPlayers));
      if (storedMatches) setMatches(JSON.parse(storedMatches));
      if (storedTournaments) setTournaments(JSON.parse(storedTournaments));
      if (storedComments) setComments(JSON.parse(storedComments));
      if (storedSoundEnabled !== null) setSoundEnabled(JSON.parse(storedSoundEnabled));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('players', JSON.stringify(players));
      await AsyncStorage.setItem('matches', JSON.stringify(matches));
      await AsyncStorage.setItem('tournaments', JSON.stringify(tournaments));
      await AsyncStorage.setItem('comments', JSON.stringify(comments));
      await AsyncStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const toggleOfflineMode = () => setIsOfflineMode(!isOfflineMode);
  const toggleSound = async () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    await AsyncStorage.setItem('soundEnabled', JSON.stringify(newSoundEnabled));
  };

  const addPlayer = async (player: Omit<Player, 'id' | 'stats'>) => {
    const newPlayer: Player = {
      ...player,
      id: players.length + 1,
      stats_wins: 0,
      stats_losses: 0,
      stats_draws: 0,
    };
    setPlayers([...players, newPlayer]);
    await saveData();
  };

  const updatePlayer = async (player: Player) => {
    setPlayers(players.map(p => p.id === player.id ? player : p));
    await saveData();
  };

  const addLocalMatch = async (match: Omit<Match, 'id' | 'comments'>) => {
    try {
      // Crear la nueva partida
      const newMatch: Match = {
        ...match,
        id: matches.length + 1,
        comments: [],
      };

      // Actualizar las estadísticas de los jugadores
      const updatedPlayers = players.map(player => {
        if (player.id === match.player1.id) {
          return {
            ...player,
            victories: match.winner?.id === player.id ? player.victories + 1 : player.victories,
            stats_wins: match.winner?.id === player.id ? player.stats_wins + 1 : player.stats_wins,
            stats_losses: match.winner?.id !== player.id ? player.stats_losses + 1 : player.stats_losses,
          };
        }
        if (player.id === match.player2.id) {
          return {
            ...player,
            victories: match.winner?.id === player.id ? player.victories + 1 : player.victories,
            stats_wins: match.winner?.id === player.id ? player.stats_wins + 1 : player.stats_wins,
            stats_losses: match.winner?.id !== player.id ? player.stats_losses + 1 : player.stats_losses,
          };
        }
        return player;
      });

      // Actualizar el estado
      setMatches(prevMatches => [...prevMatches, newMatch]);
      setPlayers(updatedPlayers);

      // Guardar los cambios
      await Promise.all([
        AsyncStorage.setItem('matches', JSON.stringify([...matches, newMatch])),
        AsyncStorage.setItem('players', JSON.stringify(updatedPlayers))
      ]);

      // Recargar los datos del backend
      try {
        const [updatedMatches, updatedPlayers] = await Promise.all([
          fetch(`${API_URL}/matches`).then(res => res.json()),
          fetch(`${API_URL}/players`).then(res => res.json())
        ]);

        setMatches(updatedMatches);
        setPlayers(updatedPlayers);
      } catch (error) {
        console.error('Error al recargar datos del backend:', error);
      }

      return newMatch;
    } catch (error) {
      console.error('Error al agregar partida:', error);
      throw error;
    }
  };

  const addComment = async (matchId: number, text: string) => {
    const newComment: Comment = {
      id: comments.length + 1,
      matchId,
      userId: 1, // TODO: Implementar sistema de usuarios
      text,
      timestamp: new Date(),
    };
    setComments([...comments, newComment]);
    await saveData();
  };

  const createTournament = async (tournament: Omit<Tournament, 'id' | 'players' | 'matches' | 'status'>) => {
    const newTournament: Tournament = {
      ...tournament,
      id: tournaments.length + 1,
      players: [],
      matches: [],
      status: 'pending',
    };
    setTournaments([...tournaments, newTournament]);
    await saveData();
  };

  const updateTournament = async (tournament: Tournament) => {
    setTournaments(tournaments.map(t => t.id === tournament.id ? tournament : t));
    await saveData();
  };

  return (
    <AppContext.Provider
      value={{
        theme: CombinedDefaultTheme,
        isOfflineMode,
        soundEnabled,
        toggleOfflineMode,
        toggleSound,
        players,
        matches,
        tournaments,
        comments,
        addPlayer,
        updatePlayer,
        addLocalMatch,
        addComment,
        createTournament,
        updateTournament,
        isAuthenticated,
        setIsAuthenticated,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}; 