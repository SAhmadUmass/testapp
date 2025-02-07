import React, { useCallback, useRef, useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ViewToken, ViewabilityConfig, ActivityIndicator, Dimensions, Platform, Pressable } from 'react-native';
import { useStore } from '@/store';
import VideoItem from '@/components/VideoItem';
import { VideoPost } from '@/types';
import { fetchVideos } from '@/services/videos';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FilterModal } from '@/components/FilterModal';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

export default function FeedScreen() {
  const { videos, setVideos, selectedCuisines, selectedDifficulties } = useStore();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get('window');
  const flatListRef = useRef<FlatList>(null);

  // Calculate actual screen height (excluding system UI)
  const SCREEN_HEIGHT = WINDOW_HEIGHT - (Platform.OS === 'android' ? 0 : insets.top);

  // Fetch initial videos
  useEffect(() => {
    loadVideos();
  }, [selectedCuisines, selectedDifficulties]); // Reload when filters change

  // Load videos function
  const loadVideos = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const { videos: newVideos } = await fetchVideos(
      selectedCuisines.length > 0 || selectedDifficulties.length > 0
        ? {
            cuisineTypes: selectedCuisines,
            difficultyLevels: selectedDifficulties
          }
        : undefined
    );
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

      {/* Filter Button */}
      <Pressable 
        style={[
          styles.filterButton,
          { top: insets.top + 8 } // Position below status bar
        ]}
        onPress={() => setIsFilterVisible(true)}
      >
        <Ionicons 
          name="filter" 
          size={24} 
          color={COLORS.black} // Dark icon on light background
        />
      </Pressable>

      {/* Filter Modal */}
      <FilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
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
  filterButton: {
    position: 'absolute',
    right: 16,
    width: 44, // Slightly smaller for top placement
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1, // Ensure it stays above videos
  },
});
