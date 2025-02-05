import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';
import { useStore } from '@/store';
import { VideoPost } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { LikeButton } from '@/components/LikeButton';
import CommentSheet from '@/components/CommentSheet';

interface VideoItemProps {
  video: VideoPost;
  isActive: boolean;
  isFirst?: boolean;
}

const DEFAULT_TAB_BAR_HEIGHT = 49; // Default height for both iOS and Android

export default function VideoItem({ video, isActive, isFirst }: VideoItemProps) {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>();
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(video.comments);
  const insets = useSafeAreaInsets();
  const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get('window');

  // Calculate dimensions
  const TAB_BAR_HEIGHT = Platform.select({ ios: DEFAULT_TAB_BAR_HEIGHT, android: DEFAULT_TAB_BAR_HEIGHT }) ?? DEFAULT_TAB_BAR_HEIGHT;
  
  // Handle video playback based on visibility
  React.useEffect(() => {
    if (!videoRef.current) return;
    
    if (isActive) {
      videoRef.current.playAsync();
    } else {
      videoRef.current.pauseAsync();
    }
  }, [isActive]);

  return (
    <View 
      style={[
        styles.container, 
        { 
          height: WINDOW_HEIGHT,
          width: WINDOW_WIDTH,
          marginTop: isFirst ? -insets.top : 0,
        }
      ]}
    >
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: video.videoUrl }}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay={isActive}
        onPlaybackStatusUpdate={status => setStatus(status)}
      />
      
      {/* Overlay Content */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)']}
        style={[
          styles.overlay,
          {
            paddingTop: isFirst ? 0 : insets.top,
          }
        ]}
      >
        {/* User Info */}
        <View style={[styles.userInfo, { marginBottom: TAB_BAR_HEIGHT + insets.bottom + 6 }] }>
          <Text style={styles.username}>@{video.username}</Text>
          <Text style={[styles.caption, { marginBottom: TAB_BAR_HEIGHT + insets.bottom + 6 }]}>{video.caption}</Text>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actions, { bottom: TAB_BAR_HEIGHT + insets.bottom + 60 }]}>
          <View style={styles.actionButton}>
            <LikeButton video={video} size={28} />
            <Text style={styles.actionText}>{video.likes}</Text>
          </View>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowComments(true)}
          >
            <FontAwesome name="comment" size={28} color="white" />
            <Text style={styles.actionText}>{commentCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome name="share" size={28} color="white" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <CommentSheet
        key={`comments-${video.id}`}
        videoId={video.id}
        isVisible={showComments}
        onClose={() => setShowComments(false)}
        onCommentCountChange={setCommentCount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    position: 'relative',
  },
  video: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  username: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  caption: {
    color: 'white',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  actions: {
    position: 'absolute',
    right: 20,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginVertical: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
}); 