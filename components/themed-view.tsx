// components/themed-view.tsx
import { View, type ViewProps } from 'react-native';

export function ThemedView({ style, ...otherProps }: ViewProps) {
  return (
    <View
      style={[
        { backgroundColor: '#fff' }, // Light mode
        style,
      ]}
      {...otherProps}
    />
  );
}