import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { toggleBookmark, hasUserBookmarked } from '@/services/database';
import { useAuth } from '@/providers/AuthProvider';

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
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkBookmarkStatus();
  }, [videoId, user?.id]);

  const checkBookmarkStatus = async () => {
    if (!user?.id) return;
    
    try {
      const hasBookmarked = await hasUserBookmarked(videoId, user.id);
      setIsBookmarked(hasBookmarked);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!user?.id || isLoading) return;

    try {
      setIsLoading(true);
      const { bookmarked } = await toggleBookmark(videoId, user.id);
      setIsBookmarked(bookmarked);
      onBookmarkChange?.(bookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleToggleBookmark}
      disabled={isLoading || !user?.id}
      style={styles.button}
    >
      <Ionicons
        name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
        size={size}
        color={isBookmarked ? activeColor : color}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
}); 