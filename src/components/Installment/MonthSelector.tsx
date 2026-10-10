import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { formatMonth, getCurrentMonth, addMonths } from '../../utils/formatters';
import { Colors } from '../../constants/theme';

interface MonthSelectorProps {
  value: string;
  onChange: (month: string) => void;
}

export default function MonthSelector({ value, onChange }: MonthSelectorProps) {
  const current = getCurrentMonth();
  const options = [
    { label: formatMonth(current), value: current },
    { label: formatMonth(addMonths(current, 1)), value: addMonths(current, 1) },
    { label: formatMonth(addMonths(current, 2)), value: addMonths(current, 2) },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Billing Start Month</Text>
      <View style={styles.buttons}>
        {options.map(opt => (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.button,
              value === opt.value ? styles.buttonActive : styles.buttonInactive,
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                value === opt.value ? styles.buttonTextActive : styles.buttonTextInactive,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  buttonInactive: {
    backgroundColor: Colors.surfaceHover,
    borderColor: Colors.border,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  buttonTextActive: {
    color: Colors.white,
  },
  buttonTextInactive: {
    color: Colors.textSecondary,
  },
});
