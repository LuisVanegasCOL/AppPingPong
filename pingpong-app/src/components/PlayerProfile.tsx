import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Alert, TouchableOpacity, Share, PermissionsAndroid, Platform } from 'react-native';
import { Button, Surface, Text, useTheme, IconButton } from 'react-native-paper';
import { RNCamera } from 'react-native-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Footer } from './Footer';
import Sound from 'react-native-sound';

interface PlayerProfileProps {
  player: {
    id: number;
    name: string;
    victories: number;
  };
  onPhotoTaken?: () => void;
}

export const PlayerProfile: React.FC<PlayerProfileProps> = ({ player, onPhotoTaken }) => {
  const { theme, soundEnabled } = useApp();
  const [showCamera, setShowCamera] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [victorySound, setVictorySound] = useState<Sound | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);

  useEffect(() => {
    loadPhoto();
    checkTutorial();
    checkCameraPermission();
    // Inicializar el sonido
    const sound = new Sound('victory.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.error('Error loading sound:', error);
        Alert.alert('Error', 'No se pudo cargar el sonido de victoria');
      }
    });
    setVictorySound(sound);

    // Limpiar el sonido cuando el componente se desmonte
    return () => {
      if (victorySound) {
        victorySound.release();
      }
    };
  }, [player.id]);

  const checkTutorial = async () => {
    try {
      const tutorialComplete = await AsyncStorage.getItem('@tutorial_complete');
      setShowTutorial(tutorialComplete !== 'true');
    } catch (error) {
      console.error('Error al verificar el estado del tutorial:', error);
      setShowTutorial(true);
    }
  };

  const completeTutorial = async () => {
    try {
      await AsyncStorage.setItem(`tutorial_shown_${player.id}`, 'true');
      setShowTutorial(false);
    } catch (error) {
      console.error('Error completing tutorial:', error);
    }
  };

  const loadPhoto = async () => {
    try {
      const savedUri = await AsyncStorage.getItem(`@player_photo_${player.id}`);
      if (savedUri) {
        setPhotoUri(savedUri);
      }
    } catch (error) {
      console.error('Error al cargar la foto guardada:', error);
      Alert.alert(
        'Error de Carga',
        'No se pudo cargar la foto guardada. La foto se restablecerá.'
      );
      setPhotoUri(null);
    }
  };

  const savePhoto = async (uri: string) => {
    try {
      if (!uri) {
        throw new Error('URI de foto inválida');
      }
      await AsyncStorage.setItem(`@player_photo_${player.id}`, uri);
    } catch (error) {
      console.error('Error al guardar la foto:', error);
      Alert.alert(
        'Error de Almacenamiento',
        'No se pudo guardar la foto. Verifica el espacio disponible en tu dispositivo.'
      );
      throw error;
    }
  };

  const checkCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permiso de Cámara',
            message: 'La aplicación necesita acceso a la cámara para tomar fotos de perfil',
            buttonNeutral: 'Preguntar luego',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          },
        );
        setCameraPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setCameraPermission(true);
      }
    } catch (err) {
      console.error('Error al solicitar permisos de cámara:', err);
      Alert.alert('Error', 'No se pudieron obtener los permisos de la cámara');
      setCameraPermission(false);
    }
  };

  const handleShowCamera = async () => {
    if (!cameraPermission) {
      await checkCameraPermission();
      if (!cameraPermission) {
        Alert.alert(
          'Permiso Denegado',
          'Necesitas otorgar permiso para usar la cámara. Por favor, activa los permisos en la configuración de tu dispositivo.',
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') }
          ]
        );
        return;
      }
    }
    setShowCamera(true);
  };

  const handleTakePhoto = async (camera: RNCamera) => {
    try {
      const options = { quality: 0.5, base64: true };
      const data = await camera.takePictureAsync(options);
      
      if (!data.uri) {
        throw new Error('No se pudo obtener la URI de la foto');
      }

      setPhotoUri(data.uri);
      await savePhoto(data.uri);
      setShowCamera(false);

      if (soundEnabled && victorySound) {
        victorySound.play((success) => {
          if (!success) {
            console.error('Error reproduciendo el sonido');
            Alert.alert('Advertencia', 'No se pudo reproducir el sonido de victoria');
          }
        });
      }

      if (onPhotoTaken) {
        onPhotoTaken();
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto. Por favor, intenta de nuevo.');
    }
  };

  const handleShare = async () => {
    try {
      if (!photoUri) {
        throw new Error('No hay foto para compartir');
      }

      const result = await Share.share({
        message: `¡Mira mi perfil de jugador en PingPong App!`,
        url: photoUri,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Compartido con: ${result.activityType}`);
        } else {
          console.log('Compartido exitosamente');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Compartir cancelado');
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      Alert.alert(
        'Error al Compartir',
        'No se pudo compartir la foto. Verifica tu conexión e inténtalo de nuevo.'
      );
    }
  };

  if (showCamera) {
    return (
      <View style={styles.container}>
        <RNCamera
          style={styles.camera}
          type={RNCamera.Constants.Type.front}
          captureAudio={false}
          androidCameraPermissionOptions={{
            title: 'Permiso para usar la cámara',
            message: 'Necesitamos tu permiso para usar la cámara',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancelar',
          }}
        >
          {({ camera, status }) => {
            if (status !== 'READY') return <View />;
            return (
              <View style={styles.cameraButtons}>
                <Button 
                  mode="contained" 
                  onPress={() => handleTakePhoto(camera)}
                  style={styles.button}
                  icon="camera"
                >
                  Tomar Foto
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowCamera(false)}
                  style={styles.button}
                  icon="close"
                >
                  Cancelar
                </Button>
              </View>
            );
          }}
        </RNCamera>
      </View>
    );
  }

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]} elevation={2}>
      {showTutorial && (
        <Surface style={[styles.tutorial, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.tutorialText}>
            ¡Bienvenido! Toca el círculo para tomar una foto de perfil
          </Text>
          <Button onPress={completeTutorial}>Entendido</Button>
        </Surface>
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={handleShowCamera}>
          {photoUri ? (
            <Image 
              source={{ uri: photoUri }} 
              style={styles.photo} 
              onError={() => {
                console.error('Error al cargar la imagen');
                setPhotoUri(null);
                Alert.alert('Error', 'No se pudo cargar la foto de perfil');
              }}
            />
          ) : (
            <MaterialCommunityIcons name="account-circle" size={100} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
        <IconButton
          icon="share"
          size={24}
          onPress={handleShare}
          style={styles.shareButton}
        />
      </View>

      <View style={styles.info}>
        <Text variant="headlineSmall">{player.name}</Text>
        <Text variant="titleMedium">Victorias: {player.victories}</Text>
        <Button 
          mode="contained-tonal" 
          onPress={() => setShowCamera(true)}
          style={styles.photoButton}
          icon="camera"
        >
          {photoUri ? 'Cambiar Foto' : 'Tomar Foto'}
        </Button>
      </View>
      
      <Footer />
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 8,
  },
  photoButton: {
    marginTop: 16,
  },
  info: {
    alignItems: 'center',
  },
  camera: {
    flex: 1,
  },
  cameraButtons: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 20,
  },
  button: {
    margin: 8,
  },
  shareButton: {
    marginLeft: 'auto',
  },
  tutorial: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    zIndex: 1000,
  },
  tutorialText: {
    color: 'white',
    marginBottom: 8,
  },
}); 