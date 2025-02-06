import React, { useCallback, useRef, useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ViewToken, ViewabilityConfig, ActivityIndicator, TouchableOpacity, Text, Dimensions } from 'react-native';
import { useStore } from '@/store';
import VideoItem from '@/components/VideoItem';
import { VideoPost } from '@/types';
import { fetchVideos, seedVideos } from '@/services/videos';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppwriteTest from '../../components/AppwriteTest';

// Import videos at the top level
const localVideo1 = require('../../assets/videos/12997454_360_640_60fps.mp4');
const localVideo2 = require('../../assets/videos/12854757_360_640_30fps.mp4');

export default function FeedScreen() {
  const { videos, setVideos } = useStore();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData>>();
  const insets = useSafeAreaInsets();
  const { height: WINDOW_HEIGHT } = Dimensions.get('window');

  // Fetch initial videos
  useEffect(() => {
    loadVideos();
  }, []);

  // Load videos function
  const loadVideos = async (lastVideo?: QueryDocumentSnapshot<DocumentData>) => {
    if (isLoading) return;
    
    setIsLoading(true);
    const { videos: newVideos, lastVisible: newLastVisible } = await fetchVideos(lastVideo);
    
    // Add local test videos if this is the first load
    if (!lastVideo) {
      const localTestVideos: VideoPost[] = [
        {
          id: 'local1',
          userId: 'localUser',
          username: 'LocalTester',
          videoUrl: localVideo1,
          caption: 'Local Test Video (60fps)',
          likes: 0,
          comments: 0,
          createdAt: new Date(),
          isLocal: true
        },
        {
          id: 'local2',
          userId: 'localUser',
          username: 'LocalTester',
          videoUrl: localVideo2,
          caption: 'Local Test Video (30fps)',
          likes: 0,
          comments: 0,
          createdAt: new Date(),
          isLocal: true
        }
      ];
      setVideos([...localTestVideos, ...newVideos]);
    } else {
      setVideos([...videos, ...newVideos]);
    }
    
    setLastVisible(newLastVisible);
    setIsLoading(false);
  };

  // Handle end reached (infinite scroll)
  const handleEndReached = () => {
    if (!isLoading && lastVisible) {
      loadVideos(lastVisible);
    }
  };

  // Handle seeding
  const handleSeed = async () => {
    setIsLoading(true);
    await seedVideos();
    await loadVideos();
    setIsLoading(false);
  };

  // Configure which items are considered "viewable"
  const viewabilityConfig: ViewabilityConfig = {
    itemVisiblePercentThreshold: 80 // Increased threshold for better accuracy
  };

  // Handle viewability changes
  const onViewableItemsChanged = useCallback(({ changed }: { changed: ViewToken[] }) => {
    const visibleItem = changed.find(({ isViewable }) => isViewable);
    if (visibleItem) {
      setActiveVideoIndex(visibleItem.index ?? 0);
    }
  }, []);

  // Create a ref for the viewability callback
  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged }
  ]);

  // Render each video item
  const renderItem = ({ item, index }: { item: VideoPost; index: number }) => (
    <VideoItem video={item} isActive={index === activeVideoIndex} isFirst={index === 0} />
  );

  // Get key for FlatList items
  const keyExtractor = (item: VideoPost) => item.id;

  // Render loading indicator
  const renderFooter = () => {
    if (!isLoading) return null;
    
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  };

  return (
    <View 
      style={styles.container}
    >
      {/* Temporary Seed Button */}
      <TouchableOpacity 
        style={[styles.seedButton, { top: insets.top + 10 }]} 
        onPress={handleSeed}
        disabled={isLoading}
      >
        <Text style={styles.seedButtonText}>
          {isLoading ? 'Loading...' : 'Seed Videos'}
        </Text>
      </TouchableOpacity>

      <FlatList
        style={styles.list}
        data={videos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        snapToInterval={WINDOW_HEIGHT}
        decelerationRate="fast"
      />

      <AppwriteTest />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  list: {
    flex: 1,
  },
  loader: {
    padding: 20,
    alignItems: 'center',
  },
  seedButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1,
  },
  seedButtonText: {
    color: 'white',
    fontSize: 14,
  },
});
