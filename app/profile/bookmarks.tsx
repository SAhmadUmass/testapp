import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, Modal, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { getUserBookmarks, clearAllBookmarks } from '@/services/database';
import { useStore } from '@/store';
import { Video } from '@/utils/types';
import { Ionicons } from '@expo/vector-icons';
import { Models } from 'appwrite';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';

interface BookmarkedVideo extends Video {
  bookmark: Models.Document & {
    description?: string;
  };
}

export default function BookmarksScreen() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const [bookmarks, setBookmarks] = useState<BookmarkedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDescription, setSelectedDescription] = useState<string | null>(null);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    if (user?.$id) {
      loadBookmarks();
    }
  }, [user?.$id]);

  const loadBookmarks = async () => {
    try {
      console.log('Loading bookmarks for user:', user?.$id);
      setIsLoading(true);
      setError(null);
      const { data, error: bookmarkError } = await getUserBookmarks(user!.$id);
      
      console.log('Received bookmarks data:', data);
      
      if (bookmarkError) {
        console.error('Bookmark error:', bookmarkError);
        throw new Error(bookmarkError);
      }

      // Transform the data to match BookmarkedVideo type
      const transformedData = data?.map(item => {
        console.log('Processing bookmark item:', item);
        // Get description from either bookmark or video
        const description = item.bookmark.description || 
          (item.video.description as string || '') || '';
        console.log('Using description:', description);
        
        return {
          id: item.video.$id,
          title: item.video.title,
          video_url: item.video.video_url,
          thumbnail_url: item.video.thumbnail_url,
          cuisine_type: item.video.cuisine_type,
          difficulty: item.video.difficulty,
          duration: item.video.duration,
          bookmark: {
            ...item.bookmark,
            description: description
          }
        };
      }) as BookmarkedVideo[];

      console.log('Transformed bookmarks data:', JSON.stringify(transformedData, null, 2));
      setBookmarks(transformedData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookmarks');
      console.error('Error loading bookmarks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllBookmarks = async () => {
    try {
      setIsLoading(true);
      const { error } = await clearAllBookmarks(user!.$id);
      if (error) {
        throw new Error(error);
      }
      setBookmarks([]);
    } catch (err: any) {
      setError(err.message || 'Failed to clear bookmarks');
      console.error('Error clearing bookmarks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoPress = (video: BookmarkedVideo) => {
    router.push({
      pathname: '/bookmarkDetail',
      params: {
        title: video.title,
        video_url: video.video_url,
        description: video.bookmark.description || '',
        storage_file_id: video.id
      }
    });
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'left']}>
        <Stack.Screen
          options={{
            headerShown: false
          }}
        />
        <View style={styles.container}>
          <Text style={styles.messageText}>
            Please sign in to view your bookmarks
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'left']}>
      <Stack.Screen
        options={{
          title: 'Bookmarks',
          headerStyle: { 
            backgroundColor: '#000',
          },
          headerShadowVisible: false,
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity 
                onPress={loadBookmarks}
                style={styles.headerButton}
              >
                <Ionicons name="refresh" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ),
          contentStyle: {
            backgroundColor: '#000',
          },
          statusBarStyle: 'light',
          statusBarTranslucent: true,
        }}
      />

      <View style={styles.container}>
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#333' }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
            <Text style={styles.actionButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#4F46E5' }]}
            onPress={loadBookmarks}
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.actionButtonText}>Refresh</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#DC2626' }]}
            onPress={() => {
              Alert.alert(
                'Clear All Bookmarks',
                'Are you sure you want to remove all your bookmarks?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: handleClearAllBookmarks,
                  },
                ]
              );
            }}
          >
            <Ionicons name="trash" size={20} color="white" />
            <Text style={styles.actionButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>

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
            contentContainerStyle={styles.list}
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
                  {item.bookmark.description && (
                    <TouchableOpacity 
                      onPress={() => setSelectedDescription(item.bookmark.description || null)}
                      style={styles.viewDescriptionButton}
                    >
                      <Ionicons name="information-circle-outline" size={16} color="#4F46E5" />
                      <Text style={styles.viewDescriptionText}>View Description</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Description Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedDescription}
          onRequestClose={() => setSelectedDescription(null)}
        >
          <View style={[styles.modalOverlay, {
            paddingTop: 24,
            paddingBottom: 24,
            paddingLeft: 24,
            paddingRight: 24,
          }]}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Description</Text>
              <ScrollView 
                style={styles.modalScrollView}
                showsVerticalScrollIndicator={true}
              >
                <Text style={styles.modalDescription}>{selectedDescription}</Text>
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setSelectedDescription(null)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerButton: {
    padding: 12,
  },
  headerRightContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  thumbnail: {
    width: 120,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  videoDetails: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  videoTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
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
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  viewDescriptionButton: {
    marginTop: 8,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDescriptionText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalScrollView: {
    marginVertical: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalDescription: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
  modalCloseButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 