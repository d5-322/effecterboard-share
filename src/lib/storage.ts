import { supabase } from './supabase'

export async function uploadImage(
  file: File,
  bucket: 'avatars' | 'posts',
  path: string
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) throw error
  return data.path
}

export function getImageUrl(
  bucket: 'avatars' | 'posts',
  path: string | null
) {
  if (!path) return null
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
    
  return data.publicUrl
}
