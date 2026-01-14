// User Types
export interface User {
  id: string;
  email: string;
  created_at?: string;
}

// Auth State
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Blog Types
export interface Blog {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_email?: string;
  created_at: string;
  updated_at?: string;
}

// Blog State
export interface BlogState {
  blogs: Blog[];
  currentBlog: Blog | null;
  loading: boolean;
  error: string | null;
}

// Form Types
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface BlogFormData {
  title: string;
  content: string;
}