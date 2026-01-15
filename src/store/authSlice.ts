import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../lib/supabase';
import { AuthState, User } from '../types';

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

// Helper function to generate a valid UUID v4
function generateGuestUUID(): string {
  return '00000000-0000-4000-8000-' + 
    Date.now().toString(16).padStart(12, '0').slice(-12);
}

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return data.user as User;
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
      return data.user as User;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const guestLogin = createAsyncThunk(
  'auth/guestLogin',
  async (_, { rejectWithValue }) => {
    try {
      // Create a guest user object with a valid UUID
      const guestUser: User = {
        id: generateGuestUUID(),
        email: 'guest@anonymous.com',
        isGuest: true,
      };
      
      // Store guest status in localStorage
      localStorage.setItem('guestUser', JSON.stringify(guestUser));
      
      return guestUser;
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
        // Clear guest user from localStorage
        localStorage.removeItem('guestUser');
      } else {
        // Regular user logout
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
        return JSON.parse(guestUser) as User;
      }
      
      // Check for regular authenticated user
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user as User;
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
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;