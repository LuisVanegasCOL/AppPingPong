import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Surface, Text, TextInput, Button, Avatar, useTheme } from 'react-native-paper';
import moment from 'moment';
import 'moment/locale/es';
import { useApp } from '../context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

moment.locale('es');

interface Comment {
  id: string;
  matchId: number;
  playerName: string;
  text: string;
  timestamp: string;
  playerPhotoUrl?: string;
}

interface MatchCommentsProps {
  matchId: number;
  currentPlayerName: string;
}

export const MatchComments: React.FC<MatchCommentsProps> = ({ matchId, currentPlayerName }) => {
  const { theme } = useApp();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadComments();
  }, [matchId]);

  const loadComments = async () => {
    try {
      const savedComments = await AsyncStorage.getItem(`match_comments_${matchId}`);
      if (savedComments) {
        setComments(JSON.parse(savedComments));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const saveComments = async (updatedComments: Comment[]) => {
    try {
      await AsyncStorage.setItem(`match_comments_${matchId}`, JSON.stringify(updatedComments));
    } catch (error) {
      console.error('Error saving comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      matchId,
      playerName: currentPlayerName,
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    await saveComments(updatedComments);
    setNewComment('');
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]} elevation={2}>
      <Text variant="titleMedium" style={styles.title}>Comentarios</Text>

      <ScrollView style={styles.commentsList}>
        {comments.map((comment) => (
          <Surface key={comment.id} style={styles.commentContainer} elevation={1}>
            <View style={styles.commentHeader}>
              <Avatar.Text 
                size={32} 
                label={comment.playerName.substring(0, 2).toUpperCase()} 
                style={{ backgroundColor: theme.colors.primary }}
              />
              <View style={styles.commentInfo}>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  {comment.playerName}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {moment(comment.timestamp).fromNow()}
                </Text>
              </View>
            </View>
            <Text variant="bodyMedium" style={styles.commentText}>
              {comment.text}
            </Text>
          </Surface>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Escribe un comentario..."
          style={styles.input}
          multiline
        />
        <Button 
          mode="contained" 
          onPress={handleAddComment}
          disabled={!newComment.trim()}
          style={styles.button}
        >
          Enviar
        </Button>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  title: {
    marginBottom: 16,
  },
  commentsList: {
    maxHeight: 300,
  },
  commentContainer: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentInfo: {
    marginLeft: 8,
    flex: 1,
  },
  commentText: {
    marginLeft: 40,
  },
  inputContainer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    marginRight: 8,
  },
  button: {
    marginBottom: 6,
  },
}); 