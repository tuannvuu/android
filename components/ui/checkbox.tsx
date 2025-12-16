import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Check } from 'lucide-react-native';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  style?: ViewStyle;
}

export function Checkbox({ checked, onCheckedChange, style }: CheckboxProps) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onCheckedChange(!checked)}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, checked && styles.checked]}>
        {checked && <Check size={16} color="#FFFFFF" />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
});