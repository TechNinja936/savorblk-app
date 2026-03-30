import { useState } from 'react'
import { supabase } from '../lib/supabase'

type Bucket = 'avatars' | 'business-photos' | 'event-flyers' | 'guide-images'

export function useUpload(bucket: Bucket) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async (uri: string, path: string): Promise<string | null> => {
    setUploading(true)
    setError(null)

    try {
      const ext = uri.split('.').pop() ?? 'jpg'
      const contentType = ext === 'png' ? 'image/png' : 'image/jpeg'

      // Read file as blob
      const response = await fetch(uri)
      const blob = await response.blob()

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, blob, { contentType, upsert: true })

      if (uploadError) {
        setError(uploadError.message)
        return null
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return data.publicUrl
    } catch (e: any) {
      setError(e.message || 'Upload failed')
      return null
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading, error }
}
