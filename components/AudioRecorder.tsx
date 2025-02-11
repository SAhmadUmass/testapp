import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { functions } from '@/config/appwrite';
import * as FileSystem from 'expo-file-system';

interface AudioRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
  onError: (error: string) => void;
}

export default function AudioRecorder({ onTranscriptionComplete, onError }: AudioRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        onError('Microphone permission not granted');
        return;
      }

      // Configure audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      onError('Failed to start recording');
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    setIsProcessing(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) throw new Error('No recording URI available');

      console.log('Recording URI:', uri);

      // Read the file as base64
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      console.log('Sending request to whispertranscribe function...');

      // Call the whispertranscribe function
      const response = await functions.createExecution(
        'whispertranscribeid',
        JSON.stringify({
          path: '/transcribe',
          audioData: base64Audio,
          fileName: 'recording.m4a',
          mimeType: 'audio/m4a'
        })
      );

      console.log('Whispertranscribe response:', response);

      let result;
      try {
        result = JSON.parse(response.responseBody);
        console.log('Parsed response:', result);
      } catch (parseError: any) {
        console.error('Failed to parse response:', response.responseBody);
        console.error('Parse error:', parseError);
        throw new Error(`Invalid response format: ${parseError.message}`);
      }
      
      if (result.success && result.transcription) {
        console.log('Transcription successful:', result.transcription);
        onTranscriptionComplete(result.transcription);
      } else {
        console.error('Transcription failed:', result);
        const errorDetails = result.details || 'No error details provided';
        throw new Error(result.error || `Transcription failed: ${errorDetails}`);
      }
    } catch (err: any) {
      console.error('Recording processing error:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      // Provide more specific error messages to the user
      let errorMessage = 'Failed to process recording';
      if (err.message?.includes('No speech detected')) {
        errorMessage = 'No speech detected or audio was unclear';
      } else if (err.message?.includes('Network request failed')) {
        errorMessage = 'Network error - please check your connection';
      } else if (err.message?.includes('No recording URI')) {
        errorMessage = 'Failed to save recording';
      }
      
      onError(`${errorMessage}. Please try again.`);
    } finally {
      setIsProcessing(false);
      setRecording(null);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.recordButton,
          isRecording && styles.recording,
          isProcessing && styles.processing
        ]}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <MaterialIcons
            name={isRecording ? "stop" : "mic"}
            size={24}
            color="#fff"
          />
        )}
      </TouchableOpacity>
      <Text style={styles.status}>
        {isProcessing
          ? 'Processing...'
          : isRecording
          ? 'Recording...'
          : 'Tap to record'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  recordButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  recording: {
    backgroundColor: '#CC0000',
  },
  processing: {
    backgroundColor: '#666666',
  },
  status: {
    fontSize: 12,
    color: '#666666',
  },
}); 