export interface User {
  id: string;
  email: string;
  created_at?: string;
  isGuest?: boolean;
}

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  author_id: string | null;
  author_email: string | null;
  author_username: string | null;
  is_guest_post: boolean;
  image_urls: string[];
  view_count: number;
  created_at: string;
  updated_at: string;
  // From joined views
  like_count?: number;
  comment_count?: number;
  author_username_profile?: string | null;
  author_avatar_url?: string | null;
  // Alias for backwards compatibility
  author_avatar?: string | null;
}

export interface Comment {
  id: string;
  blog_id: string;
  author_id: string | null;
  author_email: string | null;
  author_username: string | null;
  content: string;
  image_urls: string[];
  is_guest_comment: boolean;
  created_at: string;
  updated_at: string;
  // From joined data
  author_username_profile?: string | null;
  author_avatar_url?: string | null;
  // Alias for backwards compatibility
  author_avatar?: string | null;
}

export interface BlogLike {
  id: string;
  blog_id: string;
  user_id: string;
  created_at: string;
}

export interface BlogWithCounts extends Blog {
  like_count: number;
  comment_count: number;
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

export interface CommentState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
}

// API Response types
export interface CreateBlogPayload {
  title: string;
  content: string;
  images?: File[];
  image_urls?: string[];
}

export interface UpdateBlogPayload {
  id: string;
  title: string;
  content: string;
  image_urls?: string[];
  images?: File[];
}

export interface CreateCommentPayload {
  blog_id: string;
  content: string;
  images?: File[];
  image_urls?: string[];
}

export interface UpdateCommentPayload {
  id: string;
  content: string;
  image_urls?: string[];
  images?: File[];
}

export interface UpdateProfilePayload {
  username?: string;
  avatar_url?: string;
}

// Database Insert Types
export interface BlogInsertData {
  title: string;
  content: string;
  author_id: string | null;
  author_email: string | null;
  author_username: string | null;
  is_guest_post: boolean;
  image_urls: string[];
}

export interface CommentInsertData {
  blog_id: string;
  author_id: string | null;
  author_email: string | null;
  author_username: string | null;
  content: string;
  image_urls: string[];
  is_guest_comment: boolean;
}

// Database Update Types
export interface BlogUpdateData {
  title: string;
  content: string;
  image_urls: string[];
}

export interface CommentUpdateData {
  content: string;
  image_urls?: string[];
}

// Error Types
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Type guard for error checking
export function isSupabaseError(error: unknown): error is SupabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as SupabaseError).message === 'string'
  );
}

export function getErrorMessage(error: unknown): string {
  if (isSupabaseError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}