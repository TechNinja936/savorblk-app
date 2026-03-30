import * as Location from 'expo-location'
import * as ImagePicker from 'expo-image-picker'
import * as Notifications from 'expo-notifications'
import { Alert, Linking, Platform } from 'react-native'

/**
 * Request foreground location permission.
 * Shows a friendly prompt with rationale if denied.
 */
export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync()
  if (status === 'granted') return true

  Alert.alert(
    'Location Required',
    'SavorBLK uses your location to find nearby spots and events. Enable it in Settings.',
    [
      { text: 'Not Now', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ],
  )
  return false
}

/**
 * Get current location if permission is granted.
 */
export async function getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
  const { status } = await Location.getForegroundPermissionsAsync()
  if (status !== 'granted') return null

  const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
  return { lat: loc.coords.latitude, lng: loc.coords.longitude }
}

/**
 * Request camera roll / media library permission.
 */
export async function requestMediaPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (status === 'granted') return true

  Alert.alert(
    'Photo Access Required',
    'Allow SavorBLK to access your photos to upload images.',
    [
      { text: 'Not Now', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ],
  )
  return false
}

/**
 * Request camera permission.
 */
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync()
  return status === 'granted'
}

/**
 * Launch image picker (from library).
 * Returns the selected image URI, or null if cancelled/denied.
 */
export async function pickImage(aspect: [number, number] = [1, 1]): Promise<string | null> {
  const granted = await requestMediaPermission()
  if (!granted) return null

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect,
    quality: 0.85,
  })

  if (result.canceled || !result.assets?.[0]) return null
  return result.assets[0].uri
}

/**
 * Launch camera.
 */
export async function takePhoto(aspect: [number, number] = [1, 1]): Promise<string | null> {
  const granted = await requestCameraPermission()
  if (!granted) return null

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect,
    quality: 0.85,
  })

  if (result.canceled || !result.assets?.[0]) return null
  return result.assets[0].uri
}

/**
 * Check if push notifications permission is granted.
 */
export async function checkNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync()
  return status === 'granted'
}
