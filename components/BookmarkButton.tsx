import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { toggleBookmark, hasUserBookmarked } from '@/services/database';
import { useStore } from '@/store';
import debounce from 'lodash.debounce';

interface BookmarkButtonProps {
  videoId: string;
  size?: number;
  color?: string;
  activeColor?: string;
  onBookmarkChange?: (isBookmarked: boolean) => void;
}

export default function BookmarkButton({
  videoId,
  size = 24,
  color = '#FFFFFF',
  activeColor = '#FFD700',
  onBookmarkChange,
}: BookmarkButtonProps) {
  const user = useStore((state) => state.user);
  const [isBookmarked, setIsBookmarked] = useState(false);
  // isLoading is used exclusively for the initial bookmark status check
  const [isLoading, setIsLoading] = useState(true);
  // isProcessing is used exclusively for tracking the toggle operation
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    checkBookmarkStatus();
  }, [videoId, user?.$id]);

  const checkBookmarkStatus = async () => {
    if (!user?.$id) return;
    
    try {
      const hasBookmarked = await hasUserBookmarked(videoId, user.$id);
      setIsBookmarked(hasBookmarked);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // The core toggle function that performs the actual API call
  const handleToggleBookmark = async () => {
    // Step 3.1: Check processing flag at entry
    if (!user?.$id) {
      console.warn('Cannot toggle bookmark: No user logged in');
      return;
    }
    
    if (isProcessing) {
      console.debug('Bookmark toggle already in progress, ignoring tap');
      return;
    }

    let previousState = isBookmarked;
    try {
      // Step 3.2: Mark the start of processing
      setIsProcessing(true);
      
      // Step 3.3: Call the backend function
      const { bookmarked } = await toggleBookmark(videoId, user.$id);
      
      // Step 3.4: Update UI based on response
      setIsBookmarked(bookmarked);
      onBookmarkChange?.(bookmarked);
      
      // Log success for debugging
      console.debug(`Successfully ${bookmarked ? 'added' : 'removed'} bookmark`);
    } catch (error: any) {
      // Revert to previous state on error
      setIsBookmarked(previousState);
      
      // Provide detailed error logging
      console.error('Error toggling bookmark:', {
        error,
        videoId,
        userId: user.$id,
        previousState,
      });
      
      // Re-throw error if there's an error boundary to handle it
      throw new Error(`Failed to ${previousState ? 'remove' : 'add'} bookmark: ${error.message}`);
    } finally {
      // Step 3.5: Reset the processing flag
      setIsProcessing(false);
    }
  };

  // Create a debounced version of the toggle handler
  const debouncedToggleRef = useRef(
    debounce(handleToggleBookmark, 300, {
      leading: true, // Execute on the leading edge (first click)
      trailing: false, // Don't execute on the trailing edge
    })
  ).current;

  // Cleanup the debounced function when the component unmounts
  useEffect(() => {
    return () => {
      debouncedToggleRef.cancel();
    };
  }, [debouncedToggleRef]);

  // Determine the current state for accessibility
  const buttonState = isLoading 
    ? 'Loading bookmark status' 
    : isProcessing 
      ? `${isBookmarked ? 'Removing' : 'Adding'} bookmark` 
      : isBookmarked 
        ? 'Remove bookmark' 
        : 'Add bookmark';

  return (
    <TouchableOpacity
      onPress={debouncedToggleRef}
      disabled={isLoading || isProcessing || !user?.$id}
      style={[
        styles.button,
        // Add subtle opacity when disabled
        (isLoading || isProcessing || !user?.$id) && styles.disabled
      ]}
      // Enhance accessibility
      accessibilityRole="button"
      accessibilityState={{
        disabled: isLoading || isProcessing || !user?.$id,
        checked: isBookmarked,
      }}
      accessibilityLabel={buttonState}
      accessibilityHint={user?.$id 
        ? "Double tap to toggle bookmark status" 
        : "Sign in to bookmark this content"}
    >
      <View style={styles.iconContainer}>
        {(isLoading || isProcessing) ? (
          // Show loading spinner during loading or processing
          <ActivityIndicator 
            size={size * 0.75} 
            color={isBookmarked ? activeColor : color}
            style={styles.spinner}
          />
        ) : (
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={size}
            color={isBookmarked ? activeColor : color}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    minWidth: 40, // Ensure consistent width during state changes
    minHeight: 40, // Ensure consistent height during state changes
  },
  disabled: {
    opacity: 0.6,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  spinner: {
    position: 'absolute',
  },
}); 