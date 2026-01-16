// src/store/authSlice.ts
// Complete auth slice with profile management - FIXED profile creation

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';
import { AuthState, User, Profile } from '../types';

const initialState: AuthState = {
  user: null,
  profile: null,
  loading: false,
  error: null,
};

// Helper function to generate a valid UUID v4
function generateGuestUUID(): string {
  return '00000000-0000-4000-8000-' + 
    Date.now().toString(16).padStart(12, '0').slice(-12);
}

// Helper function to upload avatar to Supabase Storage
async function uploadAvatarInternal(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  
  const { error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file);
  
  if (error) throw error;
  
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);
  
  return urlData.publicUrl;
}

// Exported helper function for components
export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (file: File, { rejectWithValue }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      return await uploadAvatarInternal(file, user.id);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, username }: { email: string; password: string; username?: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      
      if (!data.user) throw new Error('Registration failed');
      
      // Profile will be auto-created by the database trigger
      // Wait a moment for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to fetch the profile multiple times if needed
      let profile = null;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle(); // Use maybeSingle() instead of single()
        
        if (profileData) {
          profile = profileData;
          break;
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // If profile still doesn't exist, create it manually
      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            username: username || email,
            avatar_url: null
          }])
          .select()
          .single();
        
        if (createError) {
          console.error('Failed to create profile:', createError);
        } else {
          profile = newProfile;
        }
      }
      
      // Update username if provided
      if (username && profile) {
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .update({ username })
          .eq('id', data.user.id)
          .select()
          .single();
        
        if (updatedProfile) {
          profile = updatedProfile;
        }
      }
      
      return { user: data.user as User, profile: profile as Profile | null };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Fetch user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user?.id)
        .maybeSingle(); // Use maybeSingle() instead of single()
      
      return { user: data.user as User, profile: profile as Profile | null };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const guestLogin = createAsyncThunk(
  'auth/guestLogin',
  async (_, { rejectWithValue }) => {
    try {
      const guestUser: User = {
        id: generateGuestUUID(),
        email: 'guest@anonymous.com',
        isGuest: true,
      };
      
      localStorage.setItem('guestUser', JSON.stringify(guestUser));
      
      return { user: guestUser, profile: null };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const guestUser = localStorage.getItem('guestUser');
      
      if (guestUser) {
        localStorage.removeItem('guestUser');
      } else {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      // Check for guest user first
      const guestUser = localStorage.getItem('guestUser');
      if (guestUser) {
        return { user: JSON.parse(guestUser) as User, profile: null };
      }
      
      // Check for regular authenticated user
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (!user) {
        return { user: null, profile: null };
      }
      
      // Fetch user's profile - use maybeSingle to avoid errors
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      // If profile doesn't exist, create it
      if (!profile && !profileError) {
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            username: user.email,
            avatar_url: null
          }])
          .select()
          .single();
        
        return { user: user as User, profile: newProfile as Profile | null };
      }
      
      return { user: user as User, profile: profile as Profile | null };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch user profile
export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Profile not found');
      
      return data as Profile;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Update user profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    { username, avatar_url, avatarFile }: { username?: string; avatar_url?: string | null; avatarFile?: File },
    { rejectWithValue }
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const updateData: any = { updated_at: new Date().toISOString() };
      
      if (username !== undefined) {
        updateData.username = username;
      }
      
      // Handle avatar_url directly or upload file
      if (avatar_url !== undefined) {
        updateData.avatar_url = avatar_url;
      } else if (avatarFile) {
        const avatarUrl = await uploadAvatarInternal(avatarFile, user.id);
        updateData.avatar_url = avatarUrl;
      }
      
      // Check if profile exists first
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { data, error } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            ...updateData
          }])
          .select()
          .single();
        
        if (error) throw error;
        return data as Profile;
      }
      
      // Update existing profile
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Profile;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<{ user: User; profile: Profile | null }>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ user: User; profile: Profile | null }>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(guestLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(guestLogin.fulfilled, (state, action: PayloadAction<{ user: User; profile: Profile | null }>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
      })
      .addCase(guestLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<{ user: User | null; profile: Profile | null }>) => {
        state.user = action.payload.user;
        state.profile = action.payload.profile;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.profile = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<Profile>) => {
        state.profile = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<Profile>) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;