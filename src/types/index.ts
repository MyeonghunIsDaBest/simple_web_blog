export interface User {
  id: string;
  email: string;
  created_at?: string;
  isGuest?: boolean;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_email: string;
  author_username?: string;
  author_avatar?: string | null;
  image_urls?: string[];
  created_at: string;
  updated_at: string;
  is_guest_post?: boolean;
}

export interface Comment {
  id: string;
  blog_id: string;
  author_id: string;
  author_email: string;
  author_username?: string;
  author_avatar?: string | null;
  content: string;
  image_urls?: string[];
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export interface BlogState {
  blogs: Blog[];
  currentBlog: Blog | null;
  comments: Comment[];
  loading: boolean;
  error: string | null;
}