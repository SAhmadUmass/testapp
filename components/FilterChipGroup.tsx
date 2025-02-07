import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';

interface FilterChipGroupProps<T extends string> {
  title: string;
  options: readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
}

export function FilterChipGroup<T extends string>({ 
  title, 
  options, 
  selected, 
  onToggle 
}: FilterChipGroupProps<T>) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
      >
        {options.map((option) => (
          <Pressable
            key={option}
            style={[
              styles.chip,
              selected.includes(option) && styles.chipSelected
            ]}
            onPress={() => onToggle(option)}
          >
            <Text style={[
              styles.chipText,
              selected.includes(option) && styles.chipTextSelected
            ]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.small,
  },
  title: {
    ...FONTS.h3,
    marginBottom: SIZES.small,
    marginLeft: SIZES.small,
  },
  chipContainer: {
    paddingHorizontal: SIZES.small,
    gap: SIZES.small,
  },
  chip: {
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderRadius: SIZES.large,
    backgroundColor: COLORS.lightGray,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    ...FONTS.body3,
    color: COLORS.gray,
  },
  chipTextSelected: {
    color: COLORS.white,
  },
}); 