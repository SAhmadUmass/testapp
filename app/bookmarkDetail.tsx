import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import ChatInterface from '@/components/ChatInterface';

// Get screen dimensions
const { height: WINDOW_HEIGHT } = Dimensions.get('window');

export default function BookmarkDetail() {
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>();
  const [isPlaying, setIsPlaying] = useState(true);
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  // Calculate actual screen height (excluding system UI)
  const SCREEN_HEIGHT = WINDOW_HEIGHT - (Platform.OS === 'android' ? 0 : insets.top);
  
  // Extract video details from params
  const {
    title,
    video_url,
    description,
    storage_file_id
  } = params;

  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <View style={styles.container}>
      {/* Stack Navigator Header */}
      <Stack.Screen
        options={{
          title: title as string,
          headerShown: true,
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          headerLeft: () => null,
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />

      {/* Video Section - Top Half */}
      <View style={[styles.videoContainer, { height: SCREEN_HEIGHT / 2 }]}>
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri: video_url as string }}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay={true}
          isMuted={false}
          onPlaybackStatusUpdate={status => setStatus(status)}
        />
        
        {/* Video Controls Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)']}
          style={styles.overlay}
        >
          {/* Video Info */}
          <View style={styles.videoInfo}>
            <Text style={styles.title}>{title}</Text>
          </View>

          {/* Playback Controls */}
          <View style={styles.controls}>
            <TouchableOpacity onPress={togglePlayPause} style={styles.controlButton}>
              <FontAwesome 
                name={isPlaying ? "pause" : "play"} 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Chat Section - Bottom Half */}
      <View style={[styles.chatContainer, { height: SCREEN_HEIGHT / 2 }]}>
        <ChatInterface 
          bookmarkId={storage_file_id as string}
          recipeContext={description as string}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerButton: {
    padding: 8,
  },
  videoContainer: {
    width: '100%',
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  chatContainer: {
    width: '100%',
    backgroundColor: '#fff',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
  },
  videoInfo: {
    marginBottom: 16,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 