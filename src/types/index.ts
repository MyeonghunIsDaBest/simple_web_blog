export interface User {
  id: string;
  email: string;
  created_at?: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_email: string;
  created_at: string;
  updated_at: string;
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