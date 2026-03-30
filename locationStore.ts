import { create } from 'zustand'

interface LocationState {
  coords: { latitude: number; longitude: number } | null
  detectedCity: string | null
  permissionGranted: boolean

  setCoords: (coords: { latitude: number; longitude: number } | null) => void
  setDetectedCity: (city: string | null) => void
  setPermissionGranted: (granted: boolean) => void
}

export const useLocationStore = create<LocationState>((set) => ({
  coords: null,
  detectedCity: null,
  permissionGranted: false,

  setCoords: (coords) => set({ coords }),
  setDetectedCity: (detectedCity) => set({ detectedCity }),
  setPermissionGranted: (permissionGranted) => set({ permissionGranted }),
}))
