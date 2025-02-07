import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { Comment } from '@/utils/types';
import { getComments, createComment } from '@/services/database';
import { FontAwesome } from '@expo/vector-icons';
import { useStore } from '@/store';

interface CommentSheetProps {
  videoId: string;
  isVisible: boolean;
  onClose: () => void;
  onCommentCountChange?: (newCount: number) => void;
}

export default function CommentSheet({ videoId, isVisible, onClose, onCommentCountChange }: CommentSheetProps) {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useStore();

  const fetchComments = useCallback(async () => {
    if (!videoId) return;
    
    setLoading(true);
    setError(null);
    
    const result = await getComments(videoId);
    
    if (result.error) {
      setError(result.error);
    } else {
      setComments(result.data || []);
      onCommentCountChange?.(result.data?.length || 0);
    }
    
    setLoading(false);
  }, [videoId, onCommentCountChange]);

  useEffect(() => {
    if (isVisible) {
      fetchComments();
    }
  }, [isVisible, fetchComments]);

  const handleSubmitComment = async () => {
    if (!user || !commentText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    const result = await createComment(videoId, user.$id, commentText.trim());
    setIsSubmitting(false);
    
    if (result.error) {
      setError(result.error);
      return;
    }
    
    setCommentText('');
    Keyboard.dismiss();
    fetchComments();
  };

  const renderComment = useCallback(({ item }: { item: Comment }) => (
    <View style={styles.commentContainer} key={item.$id}>
      <View style={styles.commentHeader}>
        <Text style={styles.username}>@{item.user?.name || 'user'}</Text>
        <Text style={styles.timestamp}>
          {item.created_at
            ? new Date(item.created_at).toLocaleDateString()
            : 'Just now'}
        </Text>
      </View>
      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  ), []);

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
        renderItem={renderComment}
        keyExtractor={item => item.$id}
        contentContainerStyle={styles.listContainer}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        getItemLayout={(_, index) => ({
          length: 80,
          offset: 80 * index,
          index,
        })}
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
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
              <FontAwesome name="times" size={20} color="#000" />
            </TouchableOpacity>
          </View>
          {renderContent()}
          {user && (
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={200}
              />
              <TouchableOpacity 
                onPress={handleSubmitComment}
                disabled={!commentText.trim() || isSubmitting}
                style={[
                  styles.submitButton,
                  (!commentText.trim() || isSubmitting) && styles.submitButtonDisabled
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <FontAwesome name="send" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
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
  commentInputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  commentInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
  },
  submitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#B4D8FD',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    textAlign: 'center',
  },
  commentContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
  },
  timestamp: {
    color: '#8E8E93',
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  listContainer: {
    paddingBottom: 12,
  }
}); 