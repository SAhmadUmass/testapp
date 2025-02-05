import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';
import { VideoPost } from '@/types';

interface AppState {
  // Auth State
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Video State
  videos: VideoPost[];
  setVideos: (videos: VideoPost[]) => void;
  currentVideo: VideoPost | null;
  setCurrentVideo: (video: VideoPost | null) => void;
  
  // Loading States
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Error States
  error: string | null;
  setError: (error: string | null) => void;

  // Hydration State
  isHydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
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
      setError: (error) => set({ error }),

      // Hydration State
      isHydrated: false,
      setHydrated: (hydrated) => set({ isHydrated: hydrated })
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        videos: state.videos,
        currentVideo: state.currentVideo
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      }
    }
  )
); 