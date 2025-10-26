import { create } from 'zustand';

export const useLoadingStore = create((set) => ({
  isLoading: false,
  setLoading: (state) => set({ isLoading: state }),
  startLoading: () => set({ isLoading: true }),
  stopLoading: () => set({ isLoading: false }),
}));
