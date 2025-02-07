import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppwriteUser } from '@/services/auth';
import { VideoPost } from '@/types';

export const CUISINE_TYPES = [
  'Italian',
  'Mexican',
  'Chinese',
  'Indian',
  'Japanese',
  'American',
  'Thai',
  'Mediterranean'
] as const;

export const DIFFICULTY_LEVELS = [
  'Easy',
  'Medium',
  'Hard'
] as const;

export type CuisineType = typeof CUISINE_TYPES[number];
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

interface AppState {
  // Auth State
  user: AppwriteUser | null;
  setUser: (user: AppwriteUser | null) => void;
  
  // Video State
  videos: VideoPost[];
  setVideos: (videos: VideoPost[]) => void;
  currentVideo: VideoPost | null;
  setCurrentVideo: (video: VideoPost | null) => void;
  
  // Filter State
  selectedCuisines: CuisineType[];
  selectedDifficulties: DifficultyLevel[];
  setFilters: (cuisines: CuisineType[], difficulties: DifficultyLevel[]) => void;
  clearFilters: () => void;
  
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
      
      // Filter State
      selectedCuisines: [],
      selectedDifficulties: [],
      setFilters: (cuisines, difficulties) => set({ 
        selectedCuisines: cuisines,
        selectedDifficulties: difficulties 
      }),
      clearFilters: () => set({ 
        selectedCuisines: [], 
        selectedDifficulties: [] 
      }),
      
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
        currentVideo: state.currentVideo,
        selectedCuisines: state.selectedCuisines,
        selectedDifficulties: state.selectedDifficulties
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      }
    }
  )
); 