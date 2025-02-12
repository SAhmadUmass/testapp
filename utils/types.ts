export interface User {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string;
  cuisine_type: 'Italian' | 'Mexican' | 'Chinese' | 'Indian' | 'Japanese' | 'American' | 'Thai' | 'Mediterranean';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: number;
  description: string;
}

export interface Comment {
  $id?: string;
  userId: string;
  videoId: string;
  text: string;
  created_at: string;
  user?: {
    name: string;
    email?: string;
    profile_picture?: string;
  };
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  videos: string[]; // Array of video IDs
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface VideoPost {
  id: string;
  userId: string;
  username: string;
  videoUrl: string | number;
  caption: string;
  likes: number;
  comments: number;
  createdAt: Date;
  isLocal?: boolean;
  
  // New fields from DBVideo (optional)
  thumbnail_url?: string;
  cuisine_type?: 'Italian' | 'Mexican' | 'Chinese' | 'Indian' | 'Japanese' | 'American' | 'Thai' | 'Mediterranean';
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  duration?: number; // in seconds
  description?: string;
} 