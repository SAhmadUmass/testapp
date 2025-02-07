import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { getVideo } from '@/services/database';

interface VideoPlayerProps {
  videoId: string;
}

export default function VideoPlayer({ videoId }: VideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVideo();
  }, [videoId]);

  const loadVideo = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await getVideo(videoId);
      if (error) throw new Error(error);
      if (data) {
        setVideoUrl(data.video_url);
      }
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!videoUrl) {
    return null;
  }

  return (
    <Video
      source={{ uri: videoUrl }}
      style={styles.video}
      useNativeControls
      resizeMode={ResizeMode.CONTAIN}
      shouldPlay
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
    backgroundColor: '#000',
  },
}); 