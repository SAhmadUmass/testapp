import React, { useCallback, useRef, useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ViewToken, ViewabilityConfig, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { useStore } from '@/store';
import VideoItem from '@/components/VideoItem';
import { VideoPost } from '@/types';
import { fetchVideos } from '@/services/videos';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FeedScreen() {
  const { videos, setVideos } = useStore();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get('window');
  const flatListRef = useRef<FlatList>(null);

  // Calculate actual screen height (excluding system UI)
  const SCREEN_HEIGHT = WINDOW_HEIGHT - (Platform.OS === 'android' ? 0 : insets.top);

  // Fetch initial videos
  useEffect(() => {
    loadVideos();
  }, []);

  // Load videos function
  const loadVideos = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const { videos: newVideos } = await fetchVideos();
    setVideos(newVideos);
    setIsLoading(false);
  };

  // Configure which items are considered "viewable"
  const viewabilityConfig: ViewabilityConfig = {
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 100
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
    <VideoItem 
      video={item} 
      isActive={index === activeVideoIndex} 
      isFirst={index === 0} 
    />
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
    <View style={[styles.container, { height: SCREEN_HEIGHT }]}>
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderFooter}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={3}
        removeClippedSubviews={Platform.OS === 'android'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loader: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
