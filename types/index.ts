export interface VideoPost {
  id: string;
  userId: string;
  username: string;
  videoUrl: string | number; // string for remote URLs, number for local require statements
  caption: string;
  likes: number;
  comments: number;
  createdAt: Date;
  isLocal?: boolean; // Optional flag to indicate if this is a local video
} 