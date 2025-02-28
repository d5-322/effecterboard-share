interface Profile {
  username: string;
  avatar_url: string;
}


export interface Post {
  id: string;
  user_id: string;
  username: string;
  image_url: string;
  description: string;
  user_type: 'guitarist' | 'bassist';
  created_at: string;
  likes_count: number;
  is_liked: boolean;
  profiles: Profile;
}
