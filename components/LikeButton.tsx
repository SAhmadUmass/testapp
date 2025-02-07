import React, { useEffect, useState } from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useStore } from '@/store';
import { VideoPost } from '@/types';
import { toggleLike, hasUserLiked } from '@/services/database';

interface LikeButtonProps {
    video: VideoPost;
    size?: number;
    onLikeCountChange?: (count: number) => void;
}

export function LikeButton({ video, size = 28, onLikeCountChange }: LikeButtonProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useStore();

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

    const handleLike = async () => {
        if (!user) {
            // TODO: Handle not logged in state
            return;
        }

        if (isLoading) return;

        try {
            setIsLoading(true);
            
            // Optimistic update
            const newIsLiked = !isLiked;
            setIsLiked(newIsLiked);
            if (onLikeCountChange) {
                onLikeCountChange(video.likes + (newIsLiked ? 1 : -1));
            }

            // Actual API call
            const result = await toggleLike(video.id, user.$id);
            
            // Revert if API call failed
            if (result.liked !== newIsLiked) {
                setIsLiked(result.liked);
                if (onLikeCountChange) {
                    onLikeCountChange(video.likes + (result.liked ? 1 : -1));
                }
            }
        } catch (error) {
            // Revert optimistic update on error
            setIsLiked(!isLiked);
            if (onLikeCountChange) {
                onLikeCountChange(video.likes);
            }
            console.error('Error toggling like:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableOpacity onPress={handleLike} disabled={isLoading}>
            {isLoading ? (
                <ActivityIndicator size="small" color="white" />
            ) : (
                <FontAwesome
                    name={isLiked ? "heart" : "heart-o"}
                    size={size}
                    color={isLiked ? "#ff2d55" : "white"}
                />
            )}
        </TouchableOpacity>
    );
} 