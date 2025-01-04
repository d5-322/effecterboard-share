export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          user_type: 'guitarist' | 'bassist'
          avatar_url: string | null
          message: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          user_type: 'guitarist' | 'bassist'
          avatar_url?: string | null
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          user_type?: 'guitarist' | 'bassist'
          avatar_url?: string | null
          message?: string | null
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          image_url: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          description?: string | null
          created_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          created_at?: string
        }
      }
    }
  }
}
