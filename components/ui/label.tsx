import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

interface LabelProps extends TextProps {
  children: React.ReactNode;
}

export function Label({ children, style, ...props }: LabelProps) {
  return (
    <Text style={[styles.label, style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
});