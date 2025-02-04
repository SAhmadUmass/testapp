import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  photoURL: string;
  bio?: string;
  followers: number;
  following: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Video {
  id: string;
  userId: string;
  caption: string;
  videoUrl: string;
  thumbnailUrl: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  user?: User;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  text: string;
  likes: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  user?: User;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  videos: string[]; // Array of video IDs
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirebaseResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
} 