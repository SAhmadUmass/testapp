import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Comment } from '@/utils/types';
import { getComments } from '@/services/firestore';
import { FontAwesome } from '@expo/vector-icons';

interface CommentSheetProps {
  videoId: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function CommentSheet({ videoId, isVisible, onClose }: CommentSheetProps) {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!videoId) return;
    
    setLoading(true);
    setError(null);
    
    const result = await getComments(videoId);
    
    if (result.error) {
      setError(result.error);
    } else {
      setComments(result.data || []);
    }
    
    setLoading(false);
  }, [videoId]);

  useEffect(() => {
    if (isVisible) {
      fetchComments();
    }
  }, [isVisible, fetchComments]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error loading comments: {error}</Text>
        </View>
      );
    }

    if (comments.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No comments yet. Be the first to comment!</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={comments}
        renderItem={({ item }) => (
          <View style={styles.commentContainer}>
            <View style={styles.commentHeader}>
              <Text style={styles.username}>@{item.user?.username || 'user'}</Text>
              <Text style={styles.timestamp}>
                {new Date(item.createdAt.toDate()).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.commentText}>{item.text}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={styles.sheet}>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
          <View style={styles.header}>
            <Text style={styles.headerText}>Comments</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="times" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          {renderContent()}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    padding: 16,
  },
  commentContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  username: {
    fontWeight: '700',
    fontSize: 14,
    color: '#000',
  },
  timestamp: {
    color: '#999',
    fontSize: 12,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#333',
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    fontSize: 15,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 20,
  },
}); 