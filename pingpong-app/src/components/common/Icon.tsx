import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { IconName, getIcon } from '../../config/icons';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, color, style }) => {
  const theme = useTheme();
  const iconColor = color || theme.colors.primary;
  const iconName = getIcon(name);

  return (
    <MaterialIcons
      name={iconName}
      size={size}
      color={iconColor}
      style={[styles.icon, style]}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    margin: 4,
  },
}); 