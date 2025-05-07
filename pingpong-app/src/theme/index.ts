import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

const CombinedDefaultTheme = {
  ...MD3LightTheme,
  ...NavigationDefaultTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...NavigationDefaultTheme.colors,
  },
};

const CombinedDarkTheme = {
  ...MD3DarkTheme,
  ...NavigationDarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...NavigationDarkTheme.colors,
  },
};

export { CombinedDefaultTheme, CombinedDarkTheme };

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    onPrimary: '#FFFFFF',
    primaryContainer: '#E3F2FD',
    onPrimaryContainer: '#004B87',
    secondary: '#03DAC6',
    onSecondary: '#000000',
    secondaryContainer: '#CCFFF9',
    onSecondaryContainer: '#002D2A',
    tertiary: '#4CAF50',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#E8F5E9',
    onTertiaryContainer: '#002204',
    error: '#B00020',
    onError: '#FFFFFF',
    errorContainer: '#FDECEA',
    onErrorContainer: '#410002',
    background: '#FFFFFF',
    onBackground: '#000000',
    surface: '#FFFFFF',
    onSurface: '#000000',
    surfaceVariant: '#F5F5F5',
    onSurfaceVariant: '#757575',
    outline: '#757575',
    outlineVariant: '#BDBDBD',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#000000',
    inverseOnSurface: '#FFFFFF',
    inversePrimary: '#90CAF9',
    elevation: {
      level0: 'transparent',
      level1: '#F5F5F5',
      level2: '#EEEEEE',
      level3: '#E0E0E0',
      level4: '#BDBDBD',
      level5: '#9E9E9E',
    },
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#90CAF9',
    onPrimary: '#003B6F',
    primaryContainer: '#004B87',
    onPrimaryContainer: '#D1E4FF',
    secondary: '#03DAC6',
    onSecondary: '#000000',
    secondaryContainer: '#004D40',
    onSecondaryContainer: '#70F7EE',
    tertiary: '#81C784',
    onTertiary: '#003314',
    tertiaryContainer: '#004B1C',
    onTertiaryContainer: '#95F5A0',
    error: '#CF6679',
    onError: '#000000',
    errorContainer: '#93000A',
    onErrorContainer: '#FFB4AB',
    background: '#121212',
    onBackground: '#FFFFFF',
    surface: '#121212',
    onSurface: '#FFFFFF',
    surfaceVariant: '#2C2C2C',
    onSurfaceVariant: '#BDBDBD',
    outline: '#757575',
    outlineVariant: '#424242',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#FFFFFF',
    inverseOnSurface: '#000000',
    inversePrimary: '#1976D2',
    elevation: {
      level0: 'transparent',
      level1: '#1E1E1E',
      level2: '#222222',
      level3: '#242424',
      level4: '#272727',
      level5: '#2C2C2C',
    },
  },
};

export type AppTheme = typeof lightTheme; 