import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../api/authService';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(username, password);
      if (response.token) {
        // Usamos reset para navegar a MainTabs
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Error en el inicio de sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="table-tennis" size={80} color={theme.colors.primary} />
        <Text variant="headlineMedium" style={styles.title}>
          Ping Pong App
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Inicia sesión para continuar
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Usuario"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          left={<TextInput.Icon icon="account" />}
          style={styles.input}
          autoCapitalize="none"
        />

        <TextInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          left={<TextInput.Icon icon="lock" />}
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
        >
          Iniciar Sesión
        </Button>

        <Text style={styles.credentials}>
          Usuario: admin{'\n'}Contraseña: admin
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    textAlign: 'center',
    opacity: 0.7,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 24,
  },
  credentials: {
    marginTop: 20,
    textAlign: 'center',
    opacity: 0.5,
  },
});

export default LoginScreen; 