import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';
import { Video } from '../utils/types';

interface AppState {
  // Auth State
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Video State
  videos: Video[];
  setVideos: (videos: Video[]) => void;
  currentVideo: Video | null;
  setCurrentVideo: (video: Video | null) => void;
  
  // Loading States
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Error States
  error: string | null;
  setError: (error: string | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth State
      user: null,
      setUser: (user) => set({ user }),
      
      // Video State
      videos: [],
      setVideos: (videos) => set({ videos }),
      currentVideo: null,
      setCurrentVideo: (video) => set({ currentVideo: video }),
      
      // Loading States
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      // Error States
      error: null,
      setError: (error) => set({ error })
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        videos: state.videos,
        currentVideo: state.currentVideo
      })
    }
  )
); 