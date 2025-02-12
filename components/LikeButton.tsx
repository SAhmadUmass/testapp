import React, { useEffect, useState, useCallback, useRef } from 'react';
import { TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useStore } from '@/store';
import { VideoPost } from '@/types';
import { toggleLike, hasUserLiked } from '@/services/database';
import debounce from 'lodash.debounce';

interface LikeButtonProps {
    video: VideoPost;
    size?: number;
    onLikeCountChange?: (count: number) => void;
}

export function LikeButton({ video, size = 28, onLikeCountChange }: LikeButtonProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const { user } = useStore();
    
    // Track last tap timestamp to prevent double taps
    const lastTapRef = useRef<number>(0);
    const MIN_TAP_INTERVAL = 500; // milliseconds

    // Check initial like status
    useEffect(() => {
        const checkLikeStatus = async () => {
            if (!user || !video.id) return;
            try {
                const liked = await hasUserLiked(video.id, user.$id);
                setIsLiked(liked);
            } catch (error) {
                console.error('Error checking like status:', error);
            }
        };
        checkLikeStatus();
    }, [video.id, user]);

    // Create a debounced version of the like handler
    const debouncedLike = useCallback(
        debounce(async () => {
            if (!user) return;
            
            try {
                setIsLoading(true);
                
                // Step 1: Store the previous state
                const previousIsLiked = isLiked;
                const previousLikeCount = video.likes;
                
                // Step 2: Optimistic Update
                const newIsLiked = !previousIsLiked;
                setIsLiked(newIsLiked);
                
                // Update like count optimistically
                const newLikeCount = previousLikeCount + (newIsLiked ? 1 : -1);
                if (onLikeCountChange) {
                    onLikeCountChange(newLikeCount);
                }

                // Step 3: Enhanced Backend Call with Retry Logic
                let result;
                try {
                    result = await toggleLike(video.id, user.$id);
                    // Reset retry count on successful call
                    setRetryCount(0);
                } catch (apiError) {
                    // If we haven't retried too many times, attempt retry
                    if (retryCount < 2) {
                        setRetryCount(prev => prev + 1);
                        throw apiError; // Re-throw to trigger catch block
                    }
                    
                    // Show specific error message based on error type
                    const errorMessage = apiError instanceof Error 
                        ? apiError.message
                        : 'Network error occurred';
                    
                    Alert.alert(
                        'Error',
                        `Failed to update like status: ${errorMessage}. Please try again later.`
                    );
                    throw apiError;
                }
                
                // Step 4: Enhanced State Verification and Update
                if (result.liked !== newIsLiked) {
                    // Server state differs from our optimistic update
                    setIsLiked(result.liked);
                    if (onLikeCountChange) {
                        const serverLikeCount = previousLikeCount + (result.liked ? 1 : -1);
                        onLikeCountChange(serverLikeCount);
                    }
                    
                    console.warn(
                        'Like state mismatch detected:',
                        `Client: ${newIsLiked}, Server: ${result.liked}`
                    );
                }

            } catch (error) {
                console.error('Error in like operation:', error);
                
                // Revert UI state
                setIsLiked(isLiked);
                if (onLikeCountChange) {
                    onLikeCountChange(video.likes);
                }

                // Show user-friendly error message
                if (!retryCount) {
                    Alert.alert(
                        'Action Failed',
                        'Unable to update like status. Please check your connection and try again.',
                        [
                            { 
                                text: 'Retry',
                                onPress: () => handleLike()
                            },
                            { 
                                text: 'Cancel',
                                style: 'cancel'
                            }
                        ]
                    );
                }
            } finally {
                setIsLoading(false);
            }
        }, 300), // 300ms debounce delay
        [isLiked, video.id, video.likes, user, onLikeCountChange, retryCount]
    );

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            debouncedLike.cancel();
        };
    }, [debouncedLike]);

    const handleLike = () => {
        if (!user) {
            Alert.alert('Login Required', 'Please log in to like videos.');
            return;
        }

        if (isLoading) return;

        // Prevent rapid taps using timestamp
        const now = Date.now();
        if (now - lastTapRef.current < MIN_TAP_INTERVAL) {
            return;
        }
        lastTapRef.current = now;

        // Execute the debounced like handler
        debouncedLike();
    };

    return (
        <TouchableOpacity 
            onPress={handleLike} 
            disabled={isLoading}
            style={{ 
                minWidth: size,
                minHeight: size,
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <FontAwesome
                name={isLiked ? "heart" : "heart-o"}
                size={size}
                color={isLiked ? "#ff2d55" : "white"}
            />
        </TouchableOpacity>
    );
} 