import React from 'react';
import { View, StyleSheet, Modal, Pressable, Text } from 'react-native';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { FilterChipGroup } from './FilterChipGroup';
import { useStore } from '@/store';
import { CUISINE_TYPES, DIFFICULTY_LEVELS, CuisineType, DifficultyLevel } from '@/store';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
}

export function FilterModal({ visible, onClose }: FilterModalProps) {
  const { 
    selectedCuisines, 
    selectedDifficulties, 
    setFilters,
    clearFilters 
  } = useStore();

  // Local state to track changes before applying
  const [tempCuisines, setTempCuisines] = React.useState<CuisineType[]>([]);
  const [tempDifficulties, setTempDifficulties] = React.useState<DifficultyLevel[]>([]);

  // Reset temp state when modal opens
  React.useEffect(() => {
    if (visible) {
      setTempCuisines(selectedCuisines);
      setTempDifficulties(selectedDifficulties);
    }
  }, [visible, selectedCuisines, selectedDifficulties]);

  const handleToggleCuisine = (cuisine: CuisineType) => {
    setTempCuisines(prev => 
      prev.includes(cuisine)
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const handleToggleDifficulty = (difficulty: DifficultyLevel) => {
    setTempDifficulties(prev =>
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const handleApply = () => {
    setFilters(tempCuisines, tempDifficulties);
    onClose();
  };

  const handleClear = () => {
    clearFilters();
    setTempCuisines([]);
    setTempDifficulties([]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Videos</Text>
            <Pressable onPress={handleClear}>
              <Text style={styles.clearText}>Clear All</Text>
            </Pressable>
          </View>

          <FilterChipGroup
            title="Cuisine Type"
            options={CUISINE_TYPES}
            selected={tempCuisines}
            onToggle={handleToggleCuisine}
          />

          <FilterChipGroup
            title="Difficulty Level"
            options={DIFFICULTY_LEVELS}
            selected={tempDifficulties}
            onToggle={handleToggleDifficulty}
          />

          <View style={styles.buttonContainer}>
            <Pressable 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable 
              style={[styles.button, styles.applyButton]} 
              onPress={handleApply}
            >
              <Text style={[styles.buttonText, styles.applyButtonText]}>
                Apply Filters
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.large,
    borderTopRightRadius: SIZES.large,
    padding: SIZES.medium,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  title: {
    ...FONTS.h2,
  },
  clearText: {
    ...FONTS.body3,
    color: COLORS.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SIZES.small,
    marginTop: SIZES.medium,
  },
  button: {
    flex: 1,
    padding: SIZES.small,
    borderRadius: SIZES.small,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    ...FONTS.body3,
    color: COLORS.gray,
  },
  applyButtonText: {
    color: COLORS.white,
  },
}); 