// components/themed-text.tsx
import { Text, type TextProps } from 'react-native';

type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  return (
    <Text
      style={[
        type === 'default' ? {
          fontSize: 16,
          lineHeight: 24,
          color: '#000',
        } : {},
        type === 'title' ? {
          fontSize: 32,
          fontWeight: 'bold',
          lineHeight: 32,
          color: '#000',
        } : {},
        type === 'defaultSemiBold' ? {
          fontSize: 16,
          lineHeight: 24,
          fontWeight: '600',
          color: '#000',
        } : {},
        type === 'subtitle' ? {
          fontSize: 18,
          color: '#666',
        } : {},
        type === 'link' ? {
          fontSize: 16,
          lineHeight: 30,
          color: '#0a7ea4',
        } : {},
        style,
      ]}
      {...rest}
    />
  );
}