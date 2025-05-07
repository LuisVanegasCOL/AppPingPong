declare module 'react-native-camera' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  export interface RNCameraProps extends ViewProps {
    type?: number;
    captureAudio?: boolean;
    androidCameraPermissionOptions?: {
      title?: string;
      message?: string;
      buttonPositive?: string;
      buttonNegative?: string;
    };
    children?: (params: {
      camera: RNCamera;
      status: 'READY' | 'PENDING_AUTHORIZATION' | 'NOT_AUTHORIZED';
      recordAudioPermissionStatus?: 'PENDING_AUTHORIZATION' | 'NOT_AUTHORIZED' | 'AUTHORIZED';
    }) => React.ReactNode;
  }

  export class RNCamera extends Component<RNCameraProps> {
    static Constants: {
      Type: {
        front: number;
        back: number;
      };
    };

    takePictureAsync(options?: {
      quality?: number;
      base64?: boolean;
    }): Promise<{
      uri: string;
      width: number;
      height: number;
      base64?: string;
    }>;
  }
} 