import React, { useCallback, useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withSequence,
  Easing,
  withTiming 
} from 'react-native-reanimated';
import { useStore } from '@/store';
import { batchUpdateLikes, checkIfUserLikedVideo } from '@/services/firestore';
import { VideoPost } from '@/types';

interface LikeButtonProps {
  video: VideoPost;
  size?: number;
  onLikeCountChange?: (newCount: number) => void;
}

export function LikeButton({ video, size = 28, onLikeCountChange }: LikeButtonProps) {
  const { user, videos, setVideos } = useStore();
  const [isLiked, setIsLiked] = React.useState(false);
  const scale = useSharedValue(1);

  // Skip like functionality for local videos
  if (video.isLocal) {
    return null;
  }

  // Check if user has liked the video
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user) return;
      const hasLiked = await checkIfUserLikedVideo(user.uid, video.id);
      setIsLiked(hasLiked);
    };
    checkLikeStatus();
  }, [user, video.id]);

  const updateLocalVideoState = (increment: boolean) => {
    const updatedVideos = videos.map(v => {
      if (v.id === video.id) {
        const newLikes = increment ? v.likes + 1 : v.likes - 1;
        onLikeCountChange?.(newLikes);
        return {
          ...v,
          likes: newLikes
        };
      }
      return v;
    });
    setVideos(updatedVideos);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handleLikePress = useCallback(async () => {
    if (!user) return;

    const willLike = !isLiked;
    
    // Optimistic update
    setIsLiked(willLike);
    updateLocalVideoState(willLike);
    
    // Animate the heart
    scale.value = withSequence(
      withSpring(1.2, { damping: 2 }),
      withSpring(1, { damping: 2 })
    );

    try {
      const response = await batchUpdateLikes(video.id, user.uid, willLike);
      if (response.error) {
        // Revert optimistic update on error
        console.error('Error updating like:', response.error);
        setIsLiked(!willLike);
        updateLocalVideoState(!willLike);
      }
    } catch (error) {
      console.error('Error in like handler:', error);
      setIsLiked(!willLike);
      updateLocalVideoState(!willLike);
    }
  }, [user, video.id, isLiked, videos, setVideos, onLikeCountChange]);

  if (!user) return null;

  return (
    <TouchableOpacity onPress={handleLikePress} style={styles.container}>
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        <FontAwesome
          name={isLiked ? 'heart' : 'heart-o'}
          size={size}
          color={isLiked ? '#ff2d55' : 'white'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  }
}); 