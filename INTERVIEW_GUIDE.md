# Complete Interview Preparation Guide
## Your Blog Application - Full Code & Database Breakdown

---

# TABLE OF CONTENTS

1. [Project Overview](#part-1-project-overview)
2. [Tech Stack Explained](#part-2-tech-stack-explained)
3. [Database Schema (Supabase)](#part-3-database-schema-supabase---line-by-line-breakdown)
4. [Frontend Code Breakdown](#part-4-frontend-code-breakdown)
5. [Key Concepts & Keywords](#part-5-key-concepts--keywords-you-must-know)
6. [Common Interview Questions](#part-6-common-interview-questions--answers)
7. [Quick Reference Card](#part-7-quick-reference-card)

---

# PART 1: PROJECT OVERVIEW

## What Did You Build?

You built a **full-stack blog application** - similar to Medium or WordPress.

**Main Features:**
- User registration and login (with email/password)
- Guest mode (browse and post without account)
- Create, edit, delete blog posts
- Add images to posts (with automatic compression)
- Like and comment on posts
- Search and filter posts
- Dark/Light mode toggle
- View counts for posts

---

# PART 2: TECH STACK EXPLAINED

| Technology | What It Does | Layman's Explanation |
|------------|--------------|---------------------|
| **React** | Frontend framework | The tool that builds the website users see and interact with |
| **TypeScript** | Type-safe JavaScript | Like spell-check for code - catches errors before the app runs |
| **Redux Toolkit** | State management | The "memory" of your app - remembers who's logged in, what posts exist |
| **Supabase** | Backend service | Your database + login system + file storage, all in one cloud service |
| **Tailwind CSS** | Styling | Write CSS using class names like `bg-blue-500` instead of separate CSS files |
| **PostgreSQL** | Database | Where all your data lives (blogs, users, comments) - managed by Supabase |

---

# PART 3: DATABASE SCHEMA (SUPABASE) - LINE BY LINE BREAKDOWN

This is the SQL that creates your database tables. Let me explain every single line.

## 3.1 Cleaning Up (Drop Statements)

```sql
DROP VIEW IF EXISTS blogs_with_counts CASCADE;
DROP TABLE IF EXISTS blog_likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
```

**What this does:**
- `DROP` = Delete something from the database
- `IF EXISTS` = Only delete if it's there (prevents errors if it doesn't exist)
- `CASCADE` = Also delete anything that depends on this table

**Why?** This is a "fresh start" script - it removes everything so you can rebuild from scratch.

---

## 3.2 Profiles Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Line by line:**

| Line | Explanation |
|------|-------------|
| `CREATE TABLE profiles` | Creates a new table called "profiles" |
| `id UUID PRIMARY KEY` | The unique identifier - UUID is a random string like `550e8400-e29b-41d4-a716-446655440000` |
| `REFERENCES auth.users(id)` | This ID must match a user in Supabase's built-in auth system |
| `ON DELETE CASCADE` | If the user is deleted, also delete their profile |
| `username TEXT` | A text field for the username |
| `avatar_url TEXT` | A text field storing the URL to their profile picture |
| `DEFAULT NOW()` | Automatically set to current date/time when created |

**Interview Answer:** *"The profiles table extends Supabase's built-in authentication. It stores additional user info like username and avatar. The foreign key to auth.users ensures data integrity - a profile can't exist without a valid user."*

---

## 3.3 Row Level Security (RLS) for Profiles

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

**What is RLS?**
Row Level Security is like a security guard for each row in your table. It checks: "Is this user allowed to see/edit this specific row?"

| Policy | What It Allows |
|--------|----------------|
| `FOR SELECT USING (true)` | Anyone can VIEW profiles (true = always allowed) |
| `FOR UPDATE USING (auth.uid() = id)` | Can only UPDATE if your user ID matches the profile ID |
| `FOR INSERT WITH CHECK (auth.uid() = id)` | Can only INSERT a profile for yourself |

**`auth.uid()`** = Supabase function that returns the current logged-in user's ID

**Interview Answer:** *"I use Row Level Security to protect data at the database level. Even if someone bypasses the frontend, the database itself enforces that users can only modify their own profiles."*

---

## 3.4 Blogs Table

```sql
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_email TEXT,
  author_username TEXT,
  is_guest_post BOOLEAN DEFAULT FALSE,
  image_urls TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Line by line:**

| Line | Explanation |
|------|-------------|
| `DEFAULT gen_random_uuid()` | Automatically generates a unique ID for each new blog |
| `TEXT NOT NULL` | Text that MUST have a value (can't be empty) |
| `REFERENCES auth.users(id)` | Links to the user who wrote it |
| `ON DELETE SET NULL` | If user is deleted, set author_id to NULL (don't delete the blog) |
| `is_guest_post BOOLEAN DEFAULT FALSE` | A true/false flag indicating if this was posted by a guest |
| `TEXT[] DEFAULT '{}'` | An ARRAY of text - stores multiple image URLs in one field |
| `INTEGER DEFAULT 0` | A whole number, starts at 0 |

**Why `author_email` and `author_username` are stored directly:**
For guest posts, there's no user account. We store the display info directly so we can show it even without a linked user.

**Interview Answer:** *"The blogs table stores post content and metadata. I use a TEXT array for image_urls to store multiple images per post. The is_guest_post flag handles anonymous posts, and I store author info directly so posts remain readable even if the author account is deleted."*

---

## 3.5 RLS for Blogs

```sql
CREATE POLICY "Blogs are viewable by everyone"
  ON blogs FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create blogs"
  ON blogs FOR INSERT
  WITH CHECK (auth.uid() = author_id OR author_id IS NULL);

CREATE POLICY "Users can update their own blogs"
  ON blogs FOR UPDATE
  USING (auth.uid() = author_id OR (author_id IS NULL AND is_guest_post = true));

CREATE POLICY "Users can delete their own blogs"
  ON blogs FOR DELETE
  USING (auth.uid() = author_id OR (author_id IS NULL AND is_guest_post = true));
```

**Key Logic:**
- `auth.uid() = author_id` = "Your logged-in ID matches the blog's author ID"
- `author_id IS NULL AND is_guest_post = true` = "This is a guest post (no author ID)"

**Interview Answer:** *"The blog policies allow anyone to read, but only the author can modify. Guest posts have author_id as NULL, so I check the is_guest_post flag to allow those users to edit their anonymous posts during their session."*

---

## 3.6 Comments Table

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  author_id UUID,
  author_email TEXT,
  author_username TEXT,
  content TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  is_guest_comment BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Important: NO foreign key to auth.users for author_id
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
```

**Why NO foreign key on author_id?**
This allows guest users to comment. If we had a foreign key, every comment would need a valid user account.

**`ON DELETE CASCADE` on blog_id:**
If a blog is deleted, all its comments are automatically deleted too.

**Interview Answer:** *"The comments table intentionally has no foreign key on author_id to support guest comments. However, blog_id has CASCADE delete so when a blog is removed, all comments go with it - maintaining referential integrity."*

---

## 3.7 Blog Likes Table

```sql
CREATE TABLE blog_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blog_id, user_id)
);
```

**Key Points:**
- `UNIQUE(blog_id, user_id)` = A user can only like a post ONCE (prevents spam likes)
- Both foreign keys have CASCADE = if user or blog is deleted, the like is removed

**Interview Answer:** *"The blog_likes table tracks which users liked which posts. The UNIQUE constraint on (blog_id, user_id) prevents duplicate likes - a user can only like each post once."*

---

## 3.8 Database Indexes

```sql
CREATE INDEX idx_blogs_author_id ON blogs(author_id);
CREATE INDEX idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX idx_comments_blog_id ON comments(blog_id);
CREATE INDEX idx_blog_likes_blog_id ON blog_likes(blog_id);
```

**What are indexes?**
Think of it like the index in a book - instead of reading every page to find something, you look in the index first.

**Why these specific indexes?**
- `author_id` - When viewing "my posts"
- `created_at DESC` - When sorting by newest first
- `blog_id` on comments - When fetching all comments for a post

**Interview Answer:** *"Indexes speed up database queries. I created indexes on frequently queried columns like blog_id for comments, which makes fetching all comments for a post much faster."*

---

## 3.9 The View (blogs_with_counts)

```sql
CREATE VIEW blogs_with_counts AS
SELECT
  b.*,
  COALESCE(l.like_count, 0) as like_count,
  COALESCE(c.comment_count, 0) as comment_count,
  p.username as author_username_profile,
  p.avatar_url as author_avatar_url
FROM blogs b
LEFT JOIN (
  SELECT blog_id, COUNT(*) as like_count
  FROM blog_likes
  GROUP BY blog_id
) l ON b.id = l.blog_id
LEFT JOIN (
  SELECT blog_id, COUNT(*) as comment_count
  FROM comments
  GROUP BY blog_id
) c ON b.id = c.blog_id
LEFT JOIN profiles p ON b.author_id = p.id;
```

**What is a VIEW?**
A VIEW is like a saved query. Instead of writing complex JOINs every time, you query the view like a table.

**Line by line:**
- `b.*` = All columns from blogs table
- `COALESCE(l.like_count, 0)` = If null, return 0 instead
- `LEFT JOIN` = Include all blogs, even if they have 0 likes/comments
- Subqueries count likes and comments per blog
- Final JOIN adds author profile info

**Interview Answer:** *"I created a database view to simplify fetching blogs with their like and comment counts. Instead of making multiple queries, I query this view once and get everything - the blog data, author profile, and aggregated counts."*

---

## 3.10 Stored Functions

```sql
CREATE FUNCTION increment_blog_views(blog_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE blogs SET view_count = view_count + 1 WHERE id = blog_id;
END;
$$;
```

**What is this?**
A function that adds 1 to a blog's view count. Called like: `supabase.rpc('increment_blog_views', { blog_id: '...' })`

**`SECURITY DEFINER`:**
Runs with the function creator's permissions, not the caller's. This allows the view count to update even with RLS enabled.

---

## 3.11 Trigger for New Users

```sql
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', NEW.email), NULL);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

**What is a TRIGGER?**
Automatic code that runs when something happens in the database.

**What this does:**
When a new user signs up (INSERT into auth.users), this automatically creates their profile entry.

- `NEW` = The new row that was just inserted
- `raw_user_meta_data->>'username'` = Gets username from the signup metadata
- `COALESCE(..., NEW.email)` = If no username, use their email instead

**Interview Answer:** *"I use a database trigger to automatically create a profile when a user registers. This ensures every user has a profile entry without requiring separate API calls from the frontend."*

---

## 3.12 RLS Policy for Comment Updates

```sql
CREATE POLICY "Users can update own comments"
  ON comments
  FOR UPDATE
  USING (author_id = auth.uid());
```

**What this does:**
Only allows updating a comment if the logged-in user's ID matches the comment's author_id.

---

# PART 4: FRONTEND CODE BREAKDOWN

## 4.1 Project Structure

```
src/
├── components/           # React UI components
│   ├── auth/            # Login, Register pages
│   ├── blog/            # Blog features (list, view, create, edit)
│   ├── common/          # Reusable (ImageUpload, Skeletons)
│   ├── layout/          # Navbar
│   └── profile/         # ProfileSetup
├── store/               # Redux state management
│   ├── index.ts         # Store configuration
│   ├── authSlice.ts     # Authentication logic
│   ├── blogSlice.ts     # Blog/comment/like logic
│   └── themeSlice.ts    # Dark/light mode
├── types/               # TypeScript interfaces
├── lib/                 # External services (Supabase client)
└── utils/               # Helper functions
```

---

## 4.2 Store Configuration (store/index.ts)

```typescript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import blogReducer from './blogSlice';
import themeReducer from './themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,    // Handles user login/logout
    blog: blogReducer,    // Handles blog CRUD operations
    theme: themeReducer,  // Handles dark/light mode
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Line by line:**

| Line | Explanation |
|------|-------------|
| `configureStore` | Redux Toolkit function to create the store |
| `reducer: { ... }` | Combines all slices into one store |
| `RootState` | TypeScript type for the entire state shape |
| `AppDispatch` | TypeScript type for the dispatch function |

**What is the Store?**
Think of it as a central database for your frontend. All components can read from it and send updates to it.

**Interview Answer:** *"I use Redux Toolkit's configureStore to create a centralized state store. It combines three slices - auth for user data, blog for posts/comments, and theme for UI preferences. The TypeScript types ensure type safety when accessing state."*

---

## 4.3 Auth Slice (store/authSlice.ts) - COMPLETE BREAKDOWN

### Initial State
```typescript
const initialState: AuthState = {
  user: null,      // Currently logged in user (or null)
  profile: null,   // User's profile data (username, avatar)
  loading: false,  // Is an auth operation in progress?
  error: null,     // Any error message to display
};
```

### Guest UUID Generator
```typescript
function generateGuestUUID(): string {
  return '00000000-0000-4000-8000-' +
    Date.now().toString(16).padStart(12, '0').slice(-12);
}
```
Creates a unique ID for guest users using the current timestamp.

### Login Thunk
```typescript
export const login = createAsyncThunk(
  'auth/login',  // Action type name
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
      // Call Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Also fetch the user's profile after login
      if (data.user) {
        await dispatch(fetchProfile(data.user.id));
      }

      return data.user;  // This becomes action.payload
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);
```

**What is `createAsyncThunk`?**
A Redux Toolkit function that:
1. Handles async operations (API calls)
2. Automatically creates 3 action types: `pending`, `fulfilled`, `rejected`
3. Handles try/catch and error states

**Parameters explained:**
- `rejectWithValue` - Function to return error data
- `dispatch` - Lets you call other actions (like fetchProfile)

### Guest Login
```typescript
export const guestLogin = createAsyncThunk(
  'auth/guestLogin',
  async (_, { rejectWithValue }) => {
    try {
      const guestUser = {
        id: generateGuestUUID(),
        email: 'guest@anonymous.com',
        isGuest: true,
      };

      // Store in browser's localStorage (persists even after refresh)
      localStorage.setItem('guestUser', JSON.stringify(guestUser));
      return guestUser;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);
```

**Why localStorage?**
Guest users don't have a real account, so we store their "fake" user data in the browser.

### Check Auth (On App Load)
```typescript
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // First check localStorage for guest user
      const guestUser = localStorage.getItem('guestUser');
      if (guestUser) {
        return { user: JSON.parse(guestUser), profile: null };
      }

      // Otherwise check Supabase for real user session
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        const profileResult = await dispatch(fetchProfile(user.id));
        if (fetchProfile.fulfilled.match(profileResult)) {
          return { user, profile: profileResult.payload };
        }
      }

      return { user, profile: null };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);
```

**What this does:**
1. Check if there's a guest user in localStorage
2. If not, check Supabase for an authenticated session
3. If authenticated, also fetch their profile
4. Return the user and profile data

### Extra Reducers (Handling Action Results)
```typescript
extraReducers: (builder) => {
  builder
    // Login actions
    .addCase(login.pending, (state) => {
      state.loading = true;   // Show loading spinner
      state.error = null;     // Clear old errors
    })
    .addCase(login.fulfilled, (state, action) => {
      state.loading = false;  // Hide spinner
      state.user = action.payload;  // Save the user
    })
    .addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;  // Show error
    })
    // ... similar for other thunks
}
```

**The Pattern:**
Every async thunk has 3 cases:
- `pending` - Set loading=true
- `fulfilled` - Set loading=false, save the data
- `rejected` - Set loading=false, save the error

**Interview Answer:** *"The authSlice manages all authentication state using createAsyncThunk for async operations. Each thunk handles pending, fulfilled, and rejected states automatically. I check localStorage first for guest users, then Supabase for real sessions."*

---

## 4.4 Blog Slice (store/blogSlice.ts) - COMPLETE BREAKDOWN

### Image Upload Helper
```typescript
async function uploadImages(images: File[], userId: string | null): Promise<string[]> {
  // Upload all images in PARALLEL using Promise.all
  const uploadPromises = images.map(async (image) => {
    try {
      // Step 1: Compress the image
      const compressedImage = await compressImage(image, {
        maxSizeMB: 1,           // Max file size: 1MB
        maxWidthOrHeight: 1920, // Max dimension: 1920px
        useWebWorker: true,     // Don't freeze the UI
      });

      // Step 2: Generate unique filename
      const fileExt = compressedImage.name.split('.').pop();
      const fileName = `${userId || 'guest'}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Step 3: Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, compressedImage);

      if (error) return null;

      // Step 4: Get the public URL
      const { data: urlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      return null;
    }
  });

  // Wait for ALL uploads to complete
  const results = await Promise.all(uploadPromises);

  // Filter out failed uploads (null values)
  return results.filter((url): url is string => url !== null);
}
```

**Key Concepts:**

1. **Promise.all** - Uploads all images at the same time (parallel), not one after another
2. **Compression** - Reduces file size before uploading to save bandwidth
3. **Unique filename** - Prevents overwriting: `userId/timestamp-randomstring.jpg`

**Interview Answer:** *"I compress images client-side before uploading to reduce bandwidth. Promise.all uploads all images in parallel for better performance. I generate unique filenames using timestamp and random string to prevent collisions."*

### Create Blog Thunk
```typescript
export const createBlog = createAsyncThunk(
  'blogs/createBlog',
  async (blogData: { title: string; content: string; images?: File[] }, { rejectWithValue }) => {
    try {
      const guestUser = localStorage.getItem('guestUser');

      let imageUrls: string[] = [];

      // Upload images if provided
      if (blogData.images && blogData.images.length > 0) {
        imageUrls = await uploadImages(blogData.images, userId);
      }

      // Prepare data differently for guest vs authenticated users
      let blogInsertData;

      if (guestUser) {
        // GUEST POST
        const guest = JSON.parse(guestUser);
        blogInsertData = {
          title: blogData.title,
          content: blogData.content,
          author_id: null,           // No real user ID
          author_email: guest.email,
          author_username: 'Anonymous',
          is_guest_post: true,       // Flag it as guest
          image_urls: imageUrls,
        };
      } else {
        // AUTHENTICATED POST
        const { data: { user } } = await supabase.auth.getUser();
        blogInsertData = {
          title: blogData.title,
          content: blogData.content,
          author_id: user.id,        // Real user ID
          author_email: user.email,
          author_username: profile?.username,
          is_guest_post: false,
          image_urls: imageUrls,
        };
      }

      // Insert into database
      const { data, error } = await supabase
        .from('blogs')
        .insert([blogInsertData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);
```

### Fetch Blogs (Using the View)
```typescript
export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('blogs_with_counts')  // Using the VIEW, not the table
        .select('*')
        .order('created_at', { ascending: false });  // Newest first

      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);
```

**Why use the VIEW?**
One query gets everything: blog data + like count + comment count + author profile info.

---

## 4.5 App.tsx - Main Component

```typescript
function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, profile, loading } = useSelector((state: RootState) => state.auth);
  const [view, setView] = useState<View>('login');
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // On app load, check if user is already logged in
  useEffect(() => {
    dispatch(checkAuth()).finally(() => {
      setIsInitialLoad(false);
    });
  }, [dispatch]);

  // When user or profile changes, redirect appropriately
  useEffect(() => {
    if (isInitialLoad) return;

    if (user) {
      // If logged in but no profile, show profile setup
      if (!user.isGuest && (!profile || !profile.username)) {
        setView('profile');
      } else if (view === 'login' || view === 'register' || view === 'profile') {
        setView('list');  // Go to blog list
      }
    } else {
      setView('login');  // Not logged in, show login
    }
  }, [user, profile, isInitialLoad]);
```

**Key Concepts:**

1. **useSelector** - Reads data from Redux store
2. **useDispatch** - Sends actions to Redux
3. **useState** - Local state for the current "view"
4. **useEffect** - Runs code when certain values change

### Conditional Rendering
```typescript
return (
  <div>
    <Navbar ... />

    {/* Show Login only if: no user AND view is 'login' */}
    {!user && view === 'login' && (
      <Login onSwitchToRegister={() => setView('register')} />
    )}

    {/* Show BlogList only if: user exists AND view is 'list' */}
    {user && (profile?.username || user.isGuest) && view === 'list' && (
      <BlogList onViewBlog={handleViewBlog} />
    )}

    {/* ... more conditional renders */}
  </div>
);
```

**How Navigation Works:**
- No React Router - just conditional rendering based on `view` state
- Changing `setView('list')` hides current component, shows BlogList

**Interview Answer:** *"Instead of React Router, I used conditional rendering based on a view state variable. This keeps the app simple - changing the view state causes React to re-render and show the appropriate component."*

---

## 4.6 BlogList Component - Filtering & Sorting

```typescript
const filteredAndSortedBlogs = useMemo(() => {
  let filtered = [...blogs];  // Create a copy

  // Apply search filter
  if (searchQuery) {
    filtered = filtered.filter(blog =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply category filter
  if (filterBy === 'with_images') {
    filtered = filtered.filter(blog => blog.image_urls && blog.image_urls.length > 0);
  } else if (filterBy === 'guest_posts') {
    filtered = filtered.filter(blog => blog.is_guest_post);
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'popular':
        return (b.view_count || 0) - (a.view_count || 0);
      case 'most_comments':
        return (b.comment_count || 0) - (a.comment_count || 0);
      default:
        return 0;
    }
  });

  return filtered;
}, [blogs, sortBy, filterBy, searchQuery]);  // Dependencies
```

**What is `useMemo`?**
It "remembers" the result. Only recalculates when dependencies change.

**Why use it?**
Without useMemo, filtering/sorting would run on EVERY render, even if nothing changed.

**Interview Answer:** *"I use useMemo to optimize the filtering and sorting logic. It only recalculates when blogs, sortBy, filterBy, or searchQuery change - not on every render. This prevents unnecessary computation."*

---

## 4.7 Login Component

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();  // Prevent page refresh
  setLocalError('');
  dispatch(clearError());

  // Validation
  if (!email.trim() || !password.trim()) {
    setLocalError('Please enter both email and password');
    return;
  }

  // Email format validation using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    setLocalError('Please enter a valid email address');
    return;
  }

  try {
    await dispatch(login({ email, password })).unwrap();
    // Success - component will unmount as view changes
  } catch (err) {
    setLocalError(getErrorMessage(err) || 'Login failed');
  }
};
```

**Key Concepts:**

1. **e.preventDefault()** - Stops the form from refreshing the page
2. **Validation** - Check input before sending to server
3. **.unwrap()** - Throws an error if the thunk was rejected (allows try/catch)

---

## 4.8 Image Compression Utility

```typescript
export async function compressImage(file: File, options = {}): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 1,           // Target: 1MB max
    maxWidthOrHeight: 1920, // Target: 1920px max dimension
    useWebWorker: true,     // Run in background thread
  };

  // Skip if already small enough
  const fileSizeMB = file.size / 1024 / 1024;
  if (fileSizeMB <= defaultOptions.maxSizeMB) {
    return file;  // No compression needed
  }

  try {
    const compressedFile = await imageCompression(file, defaultOptions);
    return compressedFile;
  } catch (error) {
    return file;  // Return original if compression fails
  }
}
```

**What is a WebWorker?**
A background thread that runs JavaScript without freezing the UI. Compression happens "behind the scenes."

**Interview Answer:** *"I compress images before upload using browser-image-compression library. It runs in a WebWorker so the UI stays responsive. If compression fails, I gracefully fall back to the original file."*

---

## 4.9 TypeScript Types (types/index.ts)

```typescript
export interface Blog {
  id: string;
  title: string;
  content: string;
  author_id: string | null;      // Can be string OR null
  is_guest_post: boolean;
  image_urls: string[];          // Array of strings
  view_count: number;
  created_at: string;
  // From the database VIEW
  like_count?: number;           // Optional (might not exist)
  comment_count?: number;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}
```

**Type Annotations:**
- `string | null` = Can be text OR null
- `string[]` = Array of strings
- `number?` or `?: number` = Optional, might not exist

**Interview Answer:** *"I use TypeScript interfaces to define data shapes. This catches type errors at compile time - for example, if I try to access blog.title on something that isn't a Blog, TypeScript will warn me."*

---

# PART 5: KEY CONCEPTS & KEYWORDS YOU MUST KNOW

## React Concepts

| Term | Simple Definition |
|------|-------------------|
| **Component** | A reusable piece of UI (like BlogCard) |
| **Props** | Data passed from parent to child |
| **State** | Data that can change and triggers re-render |
| **Hook** | Special function to use React features |
| **useState** | Hook to add state to a component |
| **useEffect** | Hook to run code on mount or when dependencies change |
| **useMemo** | Hook to memoize (remember) expensive calculations |
| **useCallback** | Hook to memoize functions |
| **Conditional Rendering** | Showing different UI based on conditions |

## Redux Concepts

| Term | Simple Definition |
|------|-------------------|
| **Store** | Central place where all state lives |
| **Slice** | A piece of the store for one feature |
| **Reducer** | Function that updates state based on actions |
| **Action** | An object describing what happened |
| **Dispatch** | Sending an action to the store |
| **Selector** | Function to read data from store |
| **Thunk** | Function that handles async logic |
| **createAsyncThunk** | Helper to create async actions with pending/fulfilled/rejected |

## Database Concepts

| Term | Simple Definition |
|------|-------------------|
| **Table** | Collection of rows (like an Excel spreadsheet) |
| **Column** | A field in the table (like "title", "content") |
| **Primary Key** | Unique identifier for each row |
| **Foreign Key** | Reference to another table's primary key |
| **UUID** | Universally Unique Identifier - random string ID |
| **INDEX** | Speed up searches on a column |
| **VIEW** | A saved query that acts like a table |
| **RLS** | Row Level Security - controls access per row |
| **TRIGGER** | Automatic code that runs on database events |
| **CASCADE** | Automatically delete/update related rows |

## General Programming

| Term | Simple Definition |
|------|-------------------|
| **API** | How programs communicate with each other |
| **CRUD** | Create, Read, Update, Delete |
| **Async/Await** | Modern way to handle operations that take time |
| **Promise** | Object representing future completion of async operation |
| **Promise.all** | Wait for multiple promises to complete in parallel |
| **Try/Catch** | Handle errors gracefully |
| **TypeScript** | JavaScript with type checking |
| **Interface** | Blueprint defining object shape |

---

# PART 6: COMMON INTERVIEW QUESTIONS & ANSWERS

## Q1: "Walk me through what happens when a user submits a new blog post"

**Answer:**
1. User fills in title, content, and optionally selects images
2. On submit, `handleSubmit` is called, which dispatches `createBlog` thunk
3. Redux sets `loading: true`, showing a spinner
4. The thunk:
   - Checks if user is guest (localStorage) or authenticated (Supabase)
   - If images exist, compresses them and uploads to Supabase Storage in parallel
   - Prepares the blog data object with author info
   - Inserts into the `blogs` table via Supabase
5. On success, Redux sets `loading: false` and adds the blog to state
6. Component navigates back to the blog list
7. On failure, Redux stores the error message and displays it to user

---

## Q2: "How does Row Level Security protect your data?"

**Answer:**
RLS acts as a database-level security guard. Even if someone bypasses the frontend:
- SELECT policies control who can read data
- INSERT policies control who can create data
- UPDATE/DELETE policies control who can modify data

For example, the blog update policy `USING (auth.uid() = author_id)` means even with direct database access, you can only update blogs where your user ID matches the author_id.

---

## Q3: "Why did you create a database VIEW instead of just querying tables?"

**Answer:**
The `blogs_with_counts` view joins multiple tables and calculates aggregates in one query:
- Blog data from `blogs` table
- Like count from `blog_likes` table
- Comment count from `comments` table
- Author profile from `profiles` table

Without the view, I'd need multiple queries or complex frontend logic. The view simplifies the frontend code to just: `supabase.from('blogs_with_counts').select('*')`

---

## Q4: "Explain how guest users work in your system"

**Answer:**
Guest users don't have real accounts. Here's how it works:

1. **Login:** Generate a fake user object with `isGuest: true` and store in localStorage
2. **Creating posts:** Set `author_id: null` and `is_guest_post: true`
3. **Permissions:** RLS policies allow actions where `author_id IS NULL AND is_guest_post = true`
4. **Persistence:** Guest data is stored in localStorage, so it persists during the browser session
5. **Logout:** Clear localStorage

The comments table has no foreign key on `author_id` specifically to allow guest comments.

---

## Q5: "What is createAsyncThunk and why did you use it?"

**Answer:**
`createAsyncThunk` is a Redux Toolkit helper for async operations. It:

1. **Automatically creates 3 action types:** `pending`, `fulfilled`, `rejected`
2. **Handles the async/await pattern** for API calls
3. **Provides utilities** like `rejectWithValue` for error handling
4. **Works with extraReducers** to update state based on each lifecycle stage

Example: When login is dispatched:
- `login.pending` → Set `loading: true`
- `login.fulfilled` → Save user, set `loading: false`
- `login.rejected` → Save error, set `loading: false`

---

## Q6: "How do you prevent performance issues with filtering/sorting?"

**Answer:**
I use `useMemo` to memoize the filtered and sorted blog list:

```typescript
const filteredAndSortedBlogs = useMemo(() => {
  // ... expensive filtering and sorting logic
}, [blogs, sortBy, filterBy, searchQuery]);
```

This only recalculates when the dependencies change. Without useMemo, the filtering would run on every render, even if just the theme changed.

---

## Q7: "What would you improve about this project?"

**Answer:**
1. **Add React Router** for proper URL-based navigation and browser back button support
2. **Implement real-time updates** using Supabase Realtime subscriptions
3. **Add unit tests** for Redux slices and components
4. **Add pagination** for large blog lists instead of loading all at once
5. **Implement proper error boundaries** to catch and display errors gracefully
6. **Add image lazy loading** to improve initial page load

---

# PART 7: QUICK REFERENCE CARD

## When Asked About Your Tech Choices:

> "I built a React SPA with TypeScript for type safety. I used Redux Toolkit for centralized state management because it handles async operations well with createAsyncThunk. Supabase provides the backend - PostgreSQL database, authentication, and file storage. I secured data with Row Level Security policies at the database level."

## When Asked About Your Biggest Challenge:

> "Implementing guest users alongside authenticated users was challenging. I solved it by using localStorage for guest sessions, setting author_id to NULL for guest content, and writing RLS policies that check for both authenticated users (auth.uid() = author_id) and guests (author_id IS NULL AND is_guest_post = true)."

## When Asked How Data Flows:

> "User interacts with a React component → Component dispatches a Redux thunk → Thunk calls Supabase API → Database returns data (filtered by RLS) → Thunk returns payload → Redux reducer updates state → React re-renders with new data."

---

# FINAL TIPS

1. **Understand the WHY** - Don't just memorize code, understand why each decision was made
2. **Be honest** - If you don't know something, say "I'm not sure, but I would approach it by..."
3. **Show learning attitude** - "I learned about RLS while building this, and found it really useful for..."
4. **Practice explaining** - Say your answers out loud before the interview

Good luck! You've built a solid, well-structured application.
