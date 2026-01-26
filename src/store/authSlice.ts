import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';
import { AuthState, User, Profile, getErrorMessage } from '../types';
import { RootState } from './index';

const initialState: AuthState = {
  user: null,
  profile: null,
  loading: false,
  error: null,
};

function generateGuestUUID(): string {
  return '00000000-0000-4000-8000-' + 
    Date.now().toString(16).padStart(12, '0').slice(-12);
}

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, username }: { email: string; password: string; username: string }, { rejectWithValue, dispatch }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });
      if (error) throw error;
      
      // Fetch profile after registration
      if (data.user) {
        await dispatch(fetchProfile(data.user.id));
      }
      
      return data.user as User;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue, dispatch }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Fetch profile immediately after login
      if (data.user) {
        await dispatch(fetchProfile(data.user.id));
      }
      
      return data.user as User;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
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
      return guestUser;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
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
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const guestUser = localStorage.getItem('guestUser');
      if (guestUser) {
        return { user: JSON.parse(guestUser) as User, profile: null };
      }
      
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        const profileResult = await dispatch(fetchProfile(user.id));
        // Return the profile from the fetch result
        if (fetchProfile.fulfilled.match(profileResult)) {
          return { user: user as User, profile: profileResult.payload };
        }
      }
      
      return { user: user as User, profile: null };
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist (PGRST116), return null instead of error
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      return data as Profile;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ username, avatar_url }: { username: string; avatar_url: string | null }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const userId = state.auth.user?.id;

      if (!userId) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          username,
          avatar_url,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (file: File, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const userId = state.auth.user?.id;

      if (!userId) throw new Error('No user found');

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
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
      .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(guestLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(guestLogin.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(guestLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<{ user: User; profile: Profile | null }>) => {
        state.user = action.payload.user;
        state.profile = action.payload.profile;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.profile = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<Profile | null>) => {
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
      })
      .addCase(uploadAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;