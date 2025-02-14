import { create } from 'zustand';

interface ExtraContextState {
  extraContext: string;
  setExtraContext: (context: string) => void;
}

export const useExtraContextStore = create<ExtraContextState>((set) => ({
  extraContext: '',
  setExtraContext: (context: string) => set({ extraContext: context }),
})); 