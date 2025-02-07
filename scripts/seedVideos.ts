/**
 * @deprecated ⛔️ DEPRECATED - DO NOT USE ⛔️
 * This script uses legacy Firebase implementation for seeding videos.
 * We have migrated to Appwrite. Please update this script to use Appwrite
 * database operations before using it.
 * 
 * @see services/database.ts for the current database implementation
 */

import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

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

export const seedVideos = async () => {
  try {
    const videosCollection = collection(db, 'videos');
    
    for (const video of sampleVideos) {
      await addDoc(videosCollection, video);
      console.log('Added video:', video.caption);
    }
    
    console.log('Successfully seeded videos!');
  } catch (error) {
    console.error('Error seeding videos:', error);
  }
}; 