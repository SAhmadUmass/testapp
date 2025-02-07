// TODO: Migrate to Appwrite Database
// Temporarily commented out to focus on auth migration
/*
import { collection, query, orderBy, limit, getDocs, startAfter, DocumentData, QueryDocumentSnapshot, addDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
*/
import { VideoPost } from '@/types';
import { getVideos } from '@/services/database';

const VIDEOS_PER_BATCH = 5;

// Sample video data
const sampleVideos = [
  {
    userId: 'testUser1',
    username: 'user1',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
    caption: 'Beautiful nature 🌸',
    likes: 150,
    comments: 23,
    createdAt: new Date(),
  },
  {
    userId: 'testUser1',
    username: 'user1',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-video-call-with-smartphone-at-home-40374-large.mp4',
    caption: 'Working from home 💻',
    likes: 89,
    comments: 12,
    createdAt: new Date(),
  },
  {
    userId: 'testUser2',
    username: 'user2',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-changing-lights-1240-large.mp4',
    caption: 'Friday night vibes 🕺',
    likes: 432,
    comments: 56,
    createdAt: new Date(),
  },
  {
    userId: 'testUser2',
    username: 'user2',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-at-sunset-3062-large.mp4',
    caption: 'Morning yoga session 🧘‍♀️',
    likes: 267,
    comments: 34,
    createdAt: new Date(),
  },
  {
    userId: 'testUser3',
    username: 'user3',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4',
    caption: 'Beach day 🌊',
    likes: 892,
    comments: 91,
    createdAt: new Date(),
  },
];

// Temporary mock implementations
export const seedVideos = async (): Promise<void> => {
  console.log('Video seeding will be implemented with Appwrite later');
};

export const fetchVideos = async (): Promise<{ videos: VideoPost[]; lastVisible: any }> => {
  try {
    const { data: dbVideos, error } = await getVideos(VIDEOS_PER_BATCH);
    
    if (error) {
      console.error('Error fetching videos:', error);
      return { videos: [], lastVisible: null };
    }

    // Map DBVideo format to VideoPost format
    const videos: VideoPost[] = dbVideos.map(video => ({
      id: video.$id || '',
      userId: video.userId || 'unknown',
      username: video.username || 'unknown',
      videoUrl: video.video_url,
      caption: video.title,
      likes: 0, // We'll implement likes later
      comments: 0, // We'll implement comments later
      createdAt: new Date(),
      isLocal: false,
      thumbnail_url: video.thumbnail_url,
      cuisine_type: video.cuisine_type,
      difficulty: video.difficulty,
      duration: video.duration
    }));

    return {
      videos,
      lastVisible: null // We'll implement pagination later
    };
  } catch (error) {
    console.error('Error in fetchVideos:', error);
    return { videos: [], lastVisible: null };
  }
}; 