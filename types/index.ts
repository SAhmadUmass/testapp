export interface VideoPost {
  id: string;
  userId: string;
  username: string;
  videoUrl: string;
  caption: string;
  likes: number;
  comments: number;
  createdAt: Date;
} 