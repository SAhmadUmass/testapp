// TODO: Migrate to Appwrite Database
// Temporarily commented out to focus on auth migration
/*
import { collection, query, orderBy, limit, getDocs, startAfter, DocumentData, QueryDocumentSnapshot, addDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
*/
import { VideoPost } from '@/utils/types';
import { databases, DATABASE_ID, COLLECTIONS } from '@/config/appwrite';
import { Query } from 'react-native-appwrite';

const VIDEOS_PER_BATCH = 10;

interface DBVideo {
  $id: string;
  userId: string;
  username: string;
  video_url: string;
  title: string;
  thumbnail_url: string;
  'cuisine-type': 'Italian' | 'Mexican' | 'Chinese' | 'Indian' | 'Japanese' | 'American' | 'Thai' | 'Mediterranean';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: number;
  description: string;
}

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

interface FetchVideosParams {
  cuisineTypes?: string[];
  difficultyLevels?: string[];
  limit?: number;
}

export const getVideos = async ({ 
  limit = VIDEOS_PER_BATCH,
  cuisineTypes = [],
  difficultyLevels = []
}: FetchVideosParams = {}) => {
  try {
    const queries = [Query.limit(limit)];

    // Add cuisine type filter if specified
    if (cuisineTypes.length > 0) {
      queries.push(Query.equal('cuisine-type', cuisineTypes));
    }

    // Add difficulty filter if specified
    if (difficultyLevels.length > 0) {
      queries.push(Query.equal('difficulty', difficultyLevels));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.VIDEOS,
      queries
    );

    return {
      data: response.documents as unknown as DBVideo[],
      error: null
    };
  } catch (error) {
    console.error('Error getting videos:', error);
    return {
      data: [],
      error: 'Failed to fetch videos'
    };
  }
};

export const fetchVideos = async (params?: FetchVideosParams): Promise<{ videos: VideoPost[]; lastVisible: any }> => {
  try {
    const { data: dbVideos, error } = await getVideos(params);
    
    if (error) {
      console.error('Error fetching videos:', error);
      return { videos: [], lastVisible: null };
    }

    // Map DBVideo format to VideoPost format
    const videos: VideoPost[] = dbVideos.map(video => ({
      id: video.$id,
      userId: video.userId,
      username: video.username,
      videoUrl: video.video_url,
      caption: video.title,
      likes: 0, // We'll implement likes later
      comments: 0, // We'll implement comments later
      createdAt: new Date(),
      isLocal: false,
      thumbnail_url: video.thumbnail_url,
      cuisine_type: video['cuisine-type'],
      difficulty: video.difficulty,
      duration: video.duration,
      description: video.description
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