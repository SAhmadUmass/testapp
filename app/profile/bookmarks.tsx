import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { getUserBookmarks } from '@/services/database';
import { useStore } from '@/store';
import { Video } from '@/utils/types';
import { Ionicons } from '@expo/vector-icons';
import { Models } from 'appwrite';

interface BookmarkedVideo extends Video {
  bookmark: Models.Document;
}

export default function BookmarksScreen() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const [bookmarks, setBookmarks] = useState<BookmarkedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.$id) {
      loadBookmarks();
    }
  }, [user?.$id]);

  const loadBookmarks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: bookmarkError } = await getUserBookmarks(user!.$id);
      
      if (bookmarkError) {
        throw new Error(bookmarkError);
      }

      // Transform the data to match BookmarkedVideo type
      const transformedData = data?.map(item => ({
        id: item.video.$id,
        title: item.video.title,
        video_url: item.video.video_url,
        thumbnail_url: item.video.thumbnail_url,
        cuisine_type: item.video.cuisine_type,
        difficulty: item.video.difficulty,
        duration: item.video.duration,
        bookmark: item.bookmark
      })) as BookmarkedVideo[];

      setBookmarks(transformedData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookmarks');
      console.error('Error loading bookmarks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoPress = (video: BookmarkedVideo) => {
    router.push(`/video/${video.id}`);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>
          Please sign in to view your bookmarks
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Bookmarks',
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.messageText}>{error}</Text>
          <TouchableOpacity
            onPress={loadBookmarks}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : bookmarks.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.messageText}>
            You haven't bookmarked any videos yet
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleVideoPress(item)}
              style={styles.videoItem}
            >
              <Image
                source={{ uri: item.thumbnail_url }}
                style={styles.thumbnail}
              />
              <View style={styles.videoDetails}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.videoMetadata}>
                  <Text style={styles.metadataText}>
                    {item.cuisine_type} • {item.duration}min
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          style={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  messageText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000',
  },
  list: {
    flex: 1,
  },
  videoItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  thumbnail: {
    width: 96,
    height: 64,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  videoDetails: {
    marginLeft: 16,
    flex: 1,
    justifyContent: 'center',
  },
  videoTitle: {
    color: '#fff',
    fontWeight: '500',
  },
  videoMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metadataText: {
    color: '#999',
    fontSize: 14,
  },
}); 