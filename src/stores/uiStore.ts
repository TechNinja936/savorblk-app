import { create } from 'zustand'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface UIState {
  toasts: Toast[]
  activeModal: string | null
  isSearchOpen: boolean
  selectedCity: string | null

  showToast: (message: string, type?: Toast['type']) => void
  dismissToast: (id: string) => void
  openModal: (name: string) => void
  closeModal: () => void
  setSearchOpen: (open: boolean) => void
  setSelectedCity: (city: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  activeModal: null,
  isSearchOpen: false,
  selectedCity: null,

  showToast: (message, type = 'info') =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: Date.now().toString(), message, type },
      ],
    })),

  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),
  setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
  setSelectedCity: (selectedCity) => set({ selectedCity }),
}))
