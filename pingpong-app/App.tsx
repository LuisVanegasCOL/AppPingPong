import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { CombinedDefaultTheme } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={CombinedDefaultTheme}>
      <AppProvider>
          <AppNavigator />
      </AppProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
