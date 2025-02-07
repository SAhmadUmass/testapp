import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ResizeMode, Video, VideoFullscreenUpdate, AVPlaybackStatus } from 'expo-av';
import { getVideo } from '@/services/database';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface VideoPlayerProps {
  videoId: string;
}

export default function VideoPlayer({ videoId }: VideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<Video>(null);
  const router = useRouter();

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

  const handleFullscreenUpdate = ({ fullscreenUpdate }: { fullscreenUpdate: VideoFullscreenUpdate }) => {
    switch (fullscreenUpdate) {
      case VideoFullscreenUpdate.PLAYER_DID_PRESENT:
        setIsFullscreen(true);
        break;
      case VideoFullscreenUpdate.PLAYER_DID_DISMISS:
        setIsFullscreen(false);
        break;
    }
  };

  const handleBack = () => {
    if (isFullscreen && videoRef.current) {
      videoRef.current.dismissFullscreenPlayer();
    } else {
      router.back();
    }
  };

  const CustomControls = () => (
    <View style={styles.controlsContainer}>
      <TouchableOpacity 
        onPress={handleBack}
        style={styles.backButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

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
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        onFullscreenUpdate={handleFullscreenUpdate}
      />
      {!isFullscreen && <CustomControls />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
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
  controlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backButton: {
    padding: 8,
  },
}); 