import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';
import { useStore } from '@/store';
import { VideoPost } from '@/utils/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { LikeButton } from '@/components/LikeButton';
import CommentSheet from '@/components/CommentSheet';
import { getLikeCount, getComments, getBookmarkCount, hasUserBookmarked, toggleBookmark } from '@/services/database';
import { client, COLLECTIONS, DATABASE_ID } from '@/config/appwrite';
import { Models } from 'appwrite';
import DescriptionModal from '@/components/DescriptionModal';

interface VideoItemProps {
  video: VideoPost;
  isActive: boolean;
  isFirst?: boolean;
}

const DEFAULT_TAB_BAR_HEIGHT = 49;

export default function VideoItem({ video, isActive, isFirst }: VideoItemProps) {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>();
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(video.comments);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { user } = useStore();
  const insets = useSafeAreaInsets();
  const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get('window');
  const [showDescription, setShowDescription] = useState(false);

  // Calculate actual screen height (excluding system UI)
  const SCREEN_HEIGHT = WINDOW_HEIGHT - (Platform.OS === 'android' ? 0 : insets.top);
  const TAB_BAR_HEIGHT = Platform.select({ ios: DEFAULT_TAB_BAR_HEIGHT, android: DEFAULT_TAB_BAR_HEIGHT }) ?? DEFAULT_TAB_BAR_HEIGHT;
  
  // Handle video playback based on visibility
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isActive) {
      videoRef.current.playAsync();
    } else {
      videoRef.current.pauseAsync();
      videoRef.current.setPositionAsync(0);
    }
  }, [isActive]);

  // Fetch initial counts
  useEffect(() => {
    const fetchInitialCounts = async () => {
      if (video.isLocal) return;
      try {
        // Fetch likes
        const likeCount = await getLikeCount(video.id);
        setLikeCount(likeCount);

        // Fetch comments to get initial count
        const commentsResult = await getComments(video.id);
        if (!commentsResult.error) {
          setCommentCount(commentsResult.data.length);
        }

        // Fetch bookmark count and status
        const bookmarkCount = await getBookmarkCount(video.id);
        setBookmarkCount(bookmarkCount);

        if (user) {
          const isBookmarked = await hasUserBookmarked(video.id, user.$id);
          setIsBookmarked(isBookmarked);
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };
    fetchInitialCounts();
  }, [video.id, user]);

  // Subscribe to realtime updates for comments
  useEffect(() => {
    if (!video.id || video.isLocal) return;

    // Subscribe to changes in the comments collection for this video
    const unsubscribe = client.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTIONS.COMMENTS}.documents`, 
      response => {
        // Check if the event is related to this video
        const document = response.payload as Models.Document;
        if (document.videoId === video.id) {
          // Update comment count based on the event type
          setCommentCount(prevCount => {
            if (response.events.includes('databases.*.collections.*.documents.*.create')) {
              return prevCount + 1;
            }
            if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
              return Math.max(0, prevCount - 1);
            }
            return prevCount;
          });
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [video.id]);

  const handleBookmarkPress = async () => {
    if (!user) return;
    try {
      const result = await toggleBookmark(video.id, user.$id);
      setIsBookmarked(result.bookmarked);
      setBookmarkCount(prev => result.bookmarked ? prev + 1 : Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  return (
    <View 
      style={[
        styles.container, 
        { 
          height: SCREEN_HEIGHT,
          width: WINDOW_WIDTH,
          marginTop: isFirst ? -insets.top : 0,
        }
      ]}
      key={`video-${video.id}`}
    >
      <Video
        ref={videoRef}
        style={[styles.video, { height: SCREEN_HEIGHT }]}
        source={video.isLocal ? video.videoUrl as number : { uri: video.videoUrl as string }}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay={isActive}
        onPlaybackStatusUpdate={status => setStatus(status)}
        isMuted={false}
      />
      
      {/* Overlay Content */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)']}
        style={[
          styles.overlay,
          {
            paddingTop: isFirst ? 0 : insets.top,
            paddingBottom: TAB_BAR_HEIGHT + insets.bottom,
          }
        ]}
      >
        {/* Video Info */}
        <View style={styles.userInfo}>
          <Text style={styles.title}>{video.caption}</Text>
          <TouchableOpacity onPress={() => setShowDescription(true)}>
            <Text numberOfLines={2} style={styles.description}>
              {video.description}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actions, { bottom: TAB_BAR_HEIGHT + insets.bottom + 60 }]}>
          {!video.isLocal && (
            <View style={styles.actionButton}>
              <LikeButton 
                video={{ ...video, likes: likeCount }} 
                size={28} 
                onLikeCountChange={setLikeCount}
              />
              <Text style={styles.actionText}>{likeCount}</Text>
            </View>
          )}

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

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleBookmarkPress}
          >
            <FontAwesome 
              name={isBookmarked ? "bookmark" : "bookmark-o"} 
              size={28} 
              color="white" 
            />
            <Text style={styles.actionText}>{bookmarkCount}</Text>
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

      <DescriptionModal
        isVisible={showDescription}
        onClose={() => setShowDescription(false)}
        title={video.caption}
        description={video.description}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
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
    paddingBottom: 12,
    justifyContent: 'space-between',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 25,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  actions: {
    position: 'absolute',
    right: 20,
    alignItems: 'center',
    bottom: 65,
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