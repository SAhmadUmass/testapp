import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import ChatInterface from '@/components/ChatInterface';

// Get screen dimensions
const { height: WINDOW_HEIGHT } = Dimensions.get('window');

// Type for route params
type BookmarkDetailParams = {
  title?: string;
  video_url?: string;
  description?: string;
  storage_file_id?: string;
}

export default function BookmarkDetail() {
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams() as BookmarkDetailParams;
  
  // Log initial params
  useEffect(() => {
    console.log('BookmarkDetail - Initial Params:', {
      title: params.title,
      hasVideoUrl: !!params.video_url,
      hasStorageFileId: !!params.storage_file_id,
      descriptionLength: params.description?.length || 0
    });
  }, []);

  // Calculate actual screen height (excluding system UI)
  const SCREEN_HEIGHT = WINDOW_HEIGHT - (Platform.OS === 'android' ? 0 : insets.top);
  
  // Extract video details from params with validation
  const {
    title = 'Untitled Video',
    video_url,
    description = 'No description available',
    storage_file_id
  } = params;

  // Validate required params
  if (!video_url || !storage_file_id) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Error: Missing video information</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const togglePlayPause = async () => {
    if (!videoRef.current) {
      console.warn('BookmarkDetail - Toggle failed: Video ref is null');
      return;
    }
    
    try {
      console.log('BookmarkDetail - Attempting to toggle video:', {
        currentlyPlaying: isPlaying,
        hasVideoRef: !!videoRef.current
      });

      if (isPlaying) {
        await videoRef.current.pauseAsync();
        console.log('BookmarkDetail - Video paused successfully');
      } else {
        await videoRef.current.playAsync();
        console.log('BookmarkDetail - Video resumed successfully');
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('BookmarkDetail - Error toggling video playback:', {
        error,
        wasPlaying: isPlaying
      });
    }
  };

  // Log ChatInterface props
  useEffect(() => {
    console.log('BookmarkDetail - ChatInterface props:', {
      bookmarkId: storage_file_id,
      hasRecipeContext: !!description,
      recipeContextLength: description?.length || 0
    });
  }, [storage_file_id, description]);

  return (
    <View style={styles.container}>
      {/* Stack Navigator Header */}
      <Stack.Screen
        options={{
          title: title,
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
          source={{ uri: video_url }}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay={true}
          isMuted={false}
          onPlaybackStatusUpdate={status => {
            setStatus(status);
            if (status.isLoaded) {
              console.log('BookmarkDetail - Video loaded successfully:', {
                durationMillis: status.durationMillis,
                positionMillis: status.positionMillis,
                isPlaying: status.isPlaying,
                isBuffering: status.isBuffering
              });
              setIsLoading(false);
            }
          }}
          onError={(error) => {
            console.error('BookmarkDetail - Video playback error:', {
              error,
              videoUrl: video_url
            });
            setIsLoading(false);
          }}
          onLoad={() => {
            console.log('BookmarkDetail - Video started loading:', {
              videoUrl: video_url
            });
          }}
        />
        
        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
        
        {/* Video Controls Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)']}
          style={styles.overlay}
        >
          {/* Video Info */}
          <View style={styles.videoInfo}>
            <Text style={styles.title}>{title}</Text>
            {description && (
              <Text style={styles.description} numberOfLines={2}>
                {description}
              </Text>
            )}
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
          bookmarkId={storage_file_id}
          recipeContext={description}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 12,
    backgroundColor: '#0066CC',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  headerButton: {
    padding: 8,
  },
  videoContainer: {
    width: '100%',
    backgroundColor: '#000',
    position: 'relative',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
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