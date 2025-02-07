import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';

interface DescriptionModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

export default function DescriptionModal({ isVisible, onClose, title, description }: DescriptionModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <BlurView intensity={90} style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.description}>{description}</Text>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: WINDOW_HEIGHT * 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 40,
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
  },
  scrollView: {
    padding: 20,
  },
  description: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
  },
}); 