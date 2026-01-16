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

// Upload images to Supabase storage
const uploadImages = async (files: File[], userId: string): Promise<string[]> => {
  const uploadPromises = files.map(async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  });

  return Promise.all(uploadPromises);
};

export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          profiles:author_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const blogsWithProfiles = data.map((blog: any) => ({
        ...blog,
        author_username: blog.profiles?.username || blog.author_email,
        author_avatar: blog.profiles?.avatar_url || null
      }));

      return blogsWithProfiles as Blog[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBlog = createAsyncThunk(
  'blogs/fetchBlog',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          profiles:author_id (username, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const blogWithProfile = {
        ...data,
        author_username: data.profiles?.username || data.author_email,
        author_avatar: data.profiles?.avatar_url || null
      };

      return blogWithProfile as Blog;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBlog = createAsyncThunk(
  'blogs/createBlog',
  async (
    blogData: { title: string; content: string; images?: File[] },
    { rejectWithValue }
  ) => {
    try {
      let userId = '';
      let userEmail = '';
      let username = '';
      let avatarUrl: string | null = null;

      const guestUser = localStorage.getItem('guestUser');
      
      if (guestUser) {
        const guest = JSON.parse(guestUser);
        userId = guest.id;
        userEmail = 'Anonymous';
        username = 'Anonymous';
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        userId = user.id;
        userEmail = user.email || 'Unknown';

        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', userId)
          .single();

        username = profile?.username || userEmail;
        avatarUrl = profile?.avatar_url || null;
      }

      let imageUrls: string[] = [];
      if (blogData.images && blogData.images.length > 0) {
        imageUrls = await uploadImages(blogData.images, userId);
      }

      const { data, error } = await supabase
        .from('blogs')
        .insert([
          {
            title: blogData.title,
            content: blogData.content,
            author_id: userId,
            author_email: userEmail,
            image_urls: imageUrls.length > 0 ? imageUrls : null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        author_username: username,
        author_avatar: avatarUrl
      } as Blog;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBlog = createAsyncThunk(
  'blogs/updateBlog',
  async (
    { id, title, content }: { id: string; title: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          profiles:author_id (username, avatar_url)
        `)
        .single();

      if (error) throw error;

      const blogWithProfile = {
        ...data,
        author_username: data.profiles?.username || data.author_email,
        author_avatar: data.profiles?.avatar_url || null
      };

      return blogWithProfile as Blog;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

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

export const fetchComments = createAsyncThunk(
  'blogs/fetchComments',
  async (blogId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:author_id (username, avatar_url)
        `)
        .eq('blog_id', blogId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const commentsWithProfiles = data.map((comment: any) => ({
        ...comment,
        author_username: comment.profiles?.username || comment.author_email,
        author_avatar: comment.profiles?.avatar_url || null
      }));

      return commentsWithProfiles as Comment[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createComment = createAsyncThunk(
  'blogs/createComment',
  async (
    commentData: { blogId: string; content: string; images?: File[] },
    { rejectWithValue }
  ) => {
    try {
      let userId = '';
      let userEmail = '';
      let username = '';
      let avatarUrl: string | null = null;

      const guestUser = localStorage.getItem('guestUser');
      
      if (guestUser) {
        const guest = JSON.parse(guestUser);
        userId = guest.id;
        userEmail = 'Anonymous';
        username = 'Anonymous';
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        userId = user.id;
        userEmail = user.email || 'Unknown';

        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', userId)
          .single();

        username = profile?.username || userEmail;
        avatarUrl = profile?.avatar_url || null;
      }

      let imageUrls: string[] = [];
      if (commentData.images && commentData.images.length > 0) {
        imageUrls = await uploadImages(commentData.images, userId);
      }

      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            blog_id: commentData.blogId,
            author_id: userId,
            author_email: userEmail,
            author_username: username,
            content: commentData.content,
            image_urls: imageUrls.length > 0 ? imageUrls : null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        author_username: username,
        author_avatar: avatarUrl
      } as Comment;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  'blogs/deleteComment',
  async (commentId: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      return commentId;
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
      .addCase(updateBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action: PayloadAction<Blog>) => {
        state.loading = false;
        const index = state.blogs.findIndex((blog: Blog) => blog.id === action.payload.id);
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
      .addCase(deleteBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.blogs = state.blogs.filter((blog: Blog) => blog.id !== action.payload);
        if (state.currentBlog?.id === action.payload) {
          state.currentBlog = null;
        }
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
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