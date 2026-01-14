export interface User {
  id: string;
  email: string;
  created_at?: string;
  isGuest?: boolean;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_email: string;
  created_at: string;
  updated_at: string;
  is_guest_post?: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface BlogState {
  blogs: Blog[];
  currentBlog: Blog | null;
  loading: boolean;
  error: string | null;
}