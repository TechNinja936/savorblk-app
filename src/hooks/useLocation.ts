import { useEffect } from 'react'
import * as Location from 'expo-location'
import { useLocationStore } from '../stores/locationStore'

const CITY_LOOKUP: Record<string, string> = {
  'Atlanta': 'atlanta',
  'New Orleans': 'new-orleans',
  'Houston': 'houston',
  'Chicago': 'chicago',
  'Washington': 'dc',
  'Philadelphia': 'philadelphia',
  'Baltimore': 'baltimore',
  'Charlotte': 'charlotte',
  'Memphis': 'memphis',
  'Detroit': 'detroit',
  'Nashville': 'nashville',
  'Dallas': 'dallas',
  'Miami': 'miami',
  'Los Angeles': 'los-angeles',
  'New York': 'new-york',
}

export function useLocation() {
  const { coords, detectedCity, permissionGranted, setCoords, setDetectedCity, setPermission } = useLocationStore()

  useEffect(() => {
    if (coords) return // Already have coords

    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      setPermission(status === 'granted')
      if (status !== 'granted') return

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude })

      // Reverse geocode to get city name
      const [place] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      })

      if (place?.city) {
        const cityKey = Object.keys(CITY_LOOKUP).find((k) =>
          place.city!.toLowerCase().includes(k.toLowerCase())
        )
        if (cityKey) setDetectedCity(CITY_LOOKUP[cityKey])
      }
    })()
  }, [])

  return { coords, detectedCity, permissionGranted }
}
