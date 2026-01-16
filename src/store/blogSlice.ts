// src/store/blogSlice.ts
// Complete blog slice with comments and image upload support

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';
import { BlogState, Blog, Comment } from '../types';

const initialState: BlogState = {
  blogs: [],
  currentBlog: null,
  comments: [],
  loading: false,
  error: null,
};

// Helper function to upload images to Supabase Storage
async function uploadImages(images: File[], userId: string | null): Promise<string[]> {
  const uploadedUrls: string[] = [];
  
  for (const image of images) {
    const fileExt = image.name.split('.').pop();
    const fileName = `${userId || 'guest'}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('blog-images')
      .upload(fileName, image);
    
    if (error) {
      console.error('Image upload error:', error);
      continue;
    }
    
    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);
    
    uploadedUrls.push(urlData.publicUrl);
  }
  
  return uploadedUrls;
}

// Fetch all blogs with counts (using the view)
export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('blogs_with_counts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Blog[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch single blog with counts
export const fetchBlog = createAsyncThunk(
  'blogs/fetchBlog',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('blogs_with_counts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Increment view count
      await supabase.rpc('increment_blog_views', { blog_id: id });
      
      return data as Blog;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create blog
export const createBlog = createAsyncThunk(
  'blogs/createBlog',
  async (
    blogData: { title: string; content: string; images?: File[] },
    { rejectWithValue }
  ) => {
    try {
      // Check if user is a guest
      const guestUser = localStorage.getItem('guestUser');
      
      let imageUrls: string[] = [];
      let userId: string | null = null;
      
      // Upload images if provided
      if (blogData.images && blogData.images.length > 0) {
        if (guestUser) {
          const guest = JSON.parse(guestUser);
          userId = guest.id;
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          userId = user?.id || null;
        }
        
        imageUrls = await uploadImages(blogData.images, userId);
      }
      
      let blogInsertData: any;
      
      if (guestUser) {
        // Guest post
        const guest = JSON.parse(guestUser);
        blogInsertData = {
          title: blogData.title,
          content: blogData.content,
          author_id: null,
          author_email: guest.email || 'Anonymous',
          author_username: 'Anonymous',
          is_guest_post: true,
          image_urls: imageUrls,
        };
      } else {
        // Authenticated user post
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        // Get user's profile for username
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        
        blogInsertData = {
          title: blogData.title,
          content: blogData.content,
          author_id: user.id,
          author_email: user.email,
          author_username: profile?.username || user.email,
          is_guest_post: false,
          image_urls: imageUrls,
        };
      }

      const { data, error } = await supabase
        .from('blogs')
        .insert([blogInsertData])
        .select()
        .single();

      if (error) throw error;
      return data as Blog;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Update blog
export const updateBlog = createAsyncThunk(
  'blogs/updateBlog',
  async (
    { id, title, content, images }: { 
      id: string; 
      title: string; 
      content: string; 
      images?: File[];
    },
    { rejectWithValue }
  ) => {
    try {
      const updateData: any = { 
        title, 
        content,
      };
      
      // Upload new images if provided
      if (images && images.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || null;
        const imageUrls = await uploadImages(images, userId);
        
        // Get existing images
        const { data: existingBlog } = await supabase
          .from('blogs')
          .select('image_urls')
          .eq('id', id)
          .single();
        
        // Combine existing and new images
        updateData.image_urls = [...(existingBlog?.image_urls || []), ...imageUrls];
      }
      
      const { data, error } = await supabase
        .from('blogs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Blog;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete blog
export const deleteBlog = createAsyncThunk(
  'blogs/deleteBlog',
  async (id: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Like a blog (authenticated users only)
export const likeBlog = createAsyncThunk(
  'blogs/likeBlog',
  async (blogId: string, { rejectWithValue }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to like posts');

      const { error } = await supabase
        .from('blog_likes')
        .insert([{ blog_id: blogId, user_id: user.id }]);

      if (error) throw error;
      return blogId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Unlike a blog
export const unlikeBlog = createAsyncThunk(
  'blogs/unlikeBlog',
  async (blogId: string, { rejectWithValue }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('blog_likes')
        .delete()
        .eq('blog_id', blogId)
        .eq('user_id', user.id);

      if (error) throw error;
      return blogId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Check if user has liked a blog
export const checkIfLiked = createAsyncThunk(
  'blogs/checkIfLiked',
  async (blogId: string, { rejectWithValue }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { blogId, liked: false };

      const { data, error } = await supabase
        .from('blog_likes')
        .select('id')
        .eq('blog_id', blogId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { blogId, liked: !!data };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch comments for a blog
export const fetchComments = createAsyncThunk(
  'blogs/fetchComments',
  async (blogId: string, { rejectWithValue }) => {
    try {
      // First, fetch all comments for this blog
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('*')
        .eq('blog_id', blogId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      if (!commentsData || commentsData.length === 0) {
        return [];
      }

      // Get unique author IDs (excluding null for guest comments)
      const authorIds = [...new Set(commentsData
        .map(c => c.author_id)
        .filter((id): id is string => id !== null))];

      // Fetch profiles for all authors
      let profilesMap = new Map();
      if (authorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', authorIds);
        
        if (profiles) {
          profiles.forEach(profile => {
            profilesMap.set(profile.id, profile);
          });
        }
      }

      // Map the profile data to comments
      const comments = commentsData.map((comment: any) => {
        const profile = comment.author_id ? profilesMap.get(comment.author_id) : null;
        return {
          ...comment,
          author_username_profile: profile?.username || null,
          author_avatar_url: profile?.avatar_url || null,
          author_avatar: profile?.avatar_url || null,
        };
      });
      
      return comments as Comment[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create comment
export const createComment = createAsyncThunk(
  'blogs/createComment',
  async (
    commentData: { blog_id: string; content: string; images?: File[] },
    { rejectWithValue }
  ) => {
    try {
      const guestUser = localStorage.getItem('guestUser');
      
      let imageUrls: string[] = [];
      let userId: string | null = null;
      
      // Upload images if provided
      if (commentData.images && commentData.images.length > 0) {
        if (guestUser) {
          const guest = JSON.parse(guestUser);
          userId = guest.id;
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          userId = user?.id || null;
        }
        
        imageUrls = await uploadImages(commentData.images, userId);
      }
      
      let commentInsertData: any;
      
      if (guestUser) {
        const guest = JSON.parse(guestUser);
        commentInsertData = {
          blog_id: commentData.blog_id,
          content: commentData.content,
          author_id: null,
          author_email: guest.email || 'Anonymous',
          author_username: 'Anonymous',
          is_guest_comment: true,
          image_urls: imageUrls,
        };
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        
        commentInsertData = {
          blog_id: commentData.blog_id,
          content: commentData.content,
          author_id: user.id,
          author_email: user.email,
          author_username: profile?.username || user.email,
          is_guest_comment: false,
          image_urls: imageUrls,
        };
      }

      const { data, error } = await supabase
        .from('comments')
        .insert([commentInsertData])
        .select()
        .single();

      if (error) throw error;
      return data as Comment;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete comment
export const deleteComment = createAsyncThunk(
  'blogs/deleteComment',
  async (id: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
      state.comments = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action: PayloadAction<Blog[]>) => {
        state.loading = false;
        state.blogs = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single blog
      .addCase(fetchBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlog.fulfilled, (state, action: PayloadAction<Blog>) => {
        state.loading = false;
        state.currentBlog = action.payload;
      })
      .addCase(fetchBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create blog
      .addCase(createBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action: PayloadAction<Blog>) => {
        state.loading = false;
        state.blogs.unshift(action.payload);
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update blog
      .addCase(updateBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action: PayloadAction<Blog>) => {
        state.loading = false;
        const index = state.blogs.findIndex((blog) => blog.id === action.payload.id);
        if (index !== -1) {
          state.blogs[index] = action.payload;
        }
        if (state.currentBlog?.id === action.payload.id) {
          state.currentBlog = action.payload;
        }
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete blog
      .addCase(deleteBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.blogs = state.blogs.filter((blog) => blog.id !== action.payload);
        if (state.currentBlog?.id === action.payload) {
          state.currentBlog = null;
        }
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch comments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action: PayloadAction<Comment[]>) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create comment
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action: PayloadAction<Comment>) => {
        state.loading = false;
        state.comments.push(action.payload);
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete comment
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComment.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.comments = state.comments.filter((comment: Comment) => comment.id !== action.payload);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentBlog, clearError } = blogSlice.actions;
export default blogSlice.reducer;