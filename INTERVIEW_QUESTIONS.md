# All Possible Interview Questions About Your Source Code

This document contains every question your interviewer might ask about your blog application, organized by topic.

---

# TABLE OF CONTENTS

1. [General Project Questions](#1-general-project-questions)
2. [React & Component Questions](#2-react--component-questions)
3. [Redux & State Management Questions](#3-redux--state-management-questions)
4. [TypeScript Questions](#4-typescript-questions)
5. [Supabase & Database Questions](#5-supabase--database-questions)
6. [Authentication Questions](#6-authentication-questions)
7. [Image Handling Questions](#7-image-handling-questions)
8. [Performance & Optimization Questions](#8-performance--optimization-questions)
9. [Security Questions](#9-security-questions)
10. [Code Walkthrough Questions](#10-code-walkthrough-questions)
11. [Architecture & Design Questions](#11-architecture--design-questions)
12. [Error Handling Questions](#12-error-handling-questions)
13. [Testing & Debugging Questions](#13-testing--debugging-questions)
14. [Improvement & Future Features Questions](#14-improvement--future-features-questions)

---

# 1. GENERAL PROJECT QUESTIONS

## Q1.1: "Can you describe what this application does?"

**Answer:**
This is a full-stack blog application where users can:
- Register and login with email/password
- Browse as a guest without creating an account
- Create, edit, and delete blog posts with images
- Like and comment on posts
- Search and filter posts by various criteria
- Toggle between dark and light themes

It's built with React and TypeScript on the frontend, Redux Toolkit for state management, and Supabase for the backend (database, authentication, and file storage).

---

## Q1.2: "Why did you choose this tech stack?"

**Answer:**
- **React**: Industry standard for building interactive UIs, component-based architecture makes code reusable
- **TypeScript**: Catches errors at compile time, better IDE support, self-documenting code
- **Redux Toolkit**: Simplifies Redux setup, built-in async handling with createAsyncThunk, great DevTools for debugging
- **Supabase**: Provides PostgreSQL database, authentication, and storage in one service - faster development than building a custom backend
- **Tailwind CSS**: Rapid styling without switching between files, consistent design system

---

## Q1.3: "How long did it take you to build this?"

**Answer:**
Be honest about the timeline and mention what you learned along the way. Focus on the learning process rather than speed.

---

## Q1.4: "What was the most challenging part of this project?"

**Answer:**
"Implementing guest users alongside authenticated users was challenging. I needed to:
1. Store guest sessions in localStorage since they don't have real accounts
2. Design database tables that work with NULL author_ids
3. Write RLS policies that check for both authenticated users AND guest posts
4. Ensure guests can only edit their own posts during their session"

---

## Q1.5: "Walk me through the folder structure"

**Answer:**
```
src/
├── components/        # React UI components
│   ├── auth/         # Login, Register
│   ├── blog/         # BlogList, ViewBlog, CreateBlog, EditBlog
│   ├── common/       # Shared components (ImageUpload, Skeletons)
│   ├── layout/       # Navbar
│   └── profile/      # ProfileSetup
├── store/            # Redux state management
│   ├── index.ts      # Store configuration
│   ├── authSlice.ts  # Authentication state & thunks
│   ├── blogSlice.ts  # Blog/comment/like state & thunks
│   └── themeSlice.ts # Theme state
├── types/            # TypeScript interfaces
├── lib/              # External service setup (Supabase client)
└── utils/            # Helper functions (image compression)
```

I organized by feature - all auth-related components together, all blog-related together. This makes it easy to find and maintain code.

---

# 2. REACT & COMPONENT QUESTIONS

## Q2.1: "What is a React component?"

**Answer:**
A component is a reusable piece of UI. It's a JavaScript function that returns JSX (HTML-like syntax). Components can:
- Accept inputs called "props"
- Maintain their own "state"
- Be composed together to build complex UIs

Example from my code - `BlogCard` is a component that displays one blog post. I reuse it for every post in the list.

---

## Q2.2: "What is the difference between props and state?"

**Answer:**
| Props | State |
|-------|-------|
| Passed FROM parent TO child | Managed WITHIN the component |
| Read-only (immutable) | Can be changed (mutable) |
| Used to configure a component | Used for data that changes over time |

Example in my code:
- `BlogCard` receives `blog` as a prop from `BlogList`
- `BlogList` has `searchQuery` as state that changes when user types

---

## Q2.3: "Explain the useState hook"

**Answer:**
`useState` lets you add state to functional components.

```typescript
const [view, setView] = useState('login');
```

- `view` is the current value
- `setView` is the function to update it
- `'login'` is the initial value

When you call `setView('list')`, React re-renders the component with the new value.

---

## Q2.4: "Explain the useEffect hook"

**Answer:**
`useEffect` runs side effects - code that interacts with the outside world (API calls, subscriptions, DOM manipulation).

```typescript
useEffect(() => {
  dispatch(checkAuth());  // Run this code
}, [dispatch]);           // When these dependencies change
```

- Empty array `[]` = Run once on mount
- With dependencies `[x, y]` = Run when x or y changes
- No array = Run on every render (usually bad)

---

## Q2.5: "What is useEffect's cleanup function?"

**Answer:**
The function returned from useEffect runs when the component unmounts or before the effect runs again.

```typescript
useEffect(() => {
  // Setup code
  return () => {
    dispatch(clearError());  // Cleanup code
  };
}, [dispatch]);
```

I use this in my Login component to clear errors when the user navigates away.

---

## Q2.6: "Explain the useMemo hook"

**Answer:**
`useMemo` memoizes (remembers) the result of an expensive calculation. It only recalculates when dependencies change.

```typescript
const filteredBlogs = useMemo(() => {
  // Expensive filtering/sorting logic
  return blogs.filter(...).sort(...);
}, [blogs, sortBy, filterBy, searchQuery]);
```

Without useMemo, this would run on EVERY render, even if blogs didn't change.

---

## Q2.7: "Explain the useCallback hook"

**Answer:**
`useCallback` memoizes a function itself (not its result). Useful when passing functions to child components.

```typescript
const handleBlogClick = useCallback((id: string) => {
  onViewBlog(id);
}, [onViewBlog]);
```

Without useCallback, a new function is created every render, which could cause unnecessary re-renders in child components.

---

## Q2.8: "What is conditional rendering?"

**Answer:**
Showing different UI based on conditions. I use this extensively in App.tsx:

```typescript
{!user && view === 'login' && <Login />}
{user && view === 'list' && <BlogList />}
```

This means:
- Show Login if: no user AND view is 'login'
- Show BlogList if: user exists AND view is 'list'

---

## Q2.9: "Why didn't you use React Router?"

**Answer:**
I used a simpler state-based navigation approach. A `view` state variable determines which component to render.

```typescript
const [view, setView] = useState('login');
// Changing view causes re-render with different component
```

Pros: Simpler, fewer dependencies
Cons: No URL-based navigation, no browser back button support

For a larger app, I would use React Router.

---

## Q2.10: "What are controlled vs uncontrolled components?"

**Answer:**
**Controlled**: React state controls the input value
```typescript
<input value={email} onChange={(e) => setEmail(e.target.value)} />
```

**Uncontrolled**: DOM controls the value (using refs)
```typescript
<input ref={inputRef} />
```

All my form inputs are controlled - React state is the "single source of truth."

---

## Q2.11: "What is prop drilling and how do you avoid it?"

**Answer:**
Prop drilling is passing props through many levels of components just to reach a deeply nested child.

I avoid it by using Redux - components can access state directly from the store using `useSelector`, without passing props through every level.

---

## Q2.12: "Explain the component lifecycle in functional components"

**Answer:**
Using hooks:
1. **Mounting**: Component renders, then `useEffect` with `[]` runs
2. **Updating**: State/props change, component re-renders, `useEffect` with dependencies runs
3. **Unmounting**: Cleanup functions from `useEffect` run

---

# 3. REDUX & STATE MANAGEMENT QUESTIONS

## Q3.1: "What is Redux and why use it?"

**Answer:**
Redux is a state management library. It provides:
- **Single source of truth**: All state in one place (the store)
- **Predictable state changes**: State only changes via dispatched actions
- **Time-travel debugging**: Redux DevTools lets you see every state change

I use it because my app has multiple features (auth, blogs, themes) that need to share state across many components.

---

## Q3.2: "Explain the Redux data flow"

**Answer:**
1. User clicks a button (e.g., "Login")
2. Component dispatches an action: `dispatch(login({ email, password }))`
3. Reducer receives the action and returns new state
4. Store updates with new state
5. Components subscribed to that state re-render

---

## Q3.3: "What is a Redux slice?"

**Answer:**
A slice is a bundle of reducer logic and actions for one feature. Redux Toolkit's `createSlice` creates:
- The reducer function
- Action creators
- Action types

I have three slices:
- `authSlice` - user login/logout
- `blogSlice` - blogs, comments, likes
- `themeSlice` - dark/light mode

---

## Q3.4: "What is createAsyncThunk?"

**Answer:**
A Redux Toolkit helper for async operations. It automatically creates three action types:
- `pending` - Request started
- `fulfilled` - Request succeeded
- `rejected` - Request failed

```typescript
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data.user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);
```

---

## Q3.5: "What are extraReducers?"

**Answer:**
`extraReducers` handle actions created outside the slice - like thunk actions.

```typescript
extraReducers: (builder) => {
  builder
    .addCase(login.pending, (state) => {
      state.loading = true;
    })
    .addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    })
    .addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
}
```

---

## Q3.6: "What is the difference between useSelector and useDispatch?"

**Answer:**
| useSelector | useDispatch |
|-------------|-------------|
| READS data from the store | SENDS actions to the store |
| Takes a selector function | Returns the dispatch function |
| `const user = useSelector(state => state.auth.user)` | `dispatch(login({ email, password }))` |

---

## Q3.7: "What is rejectWithValue?"

**Answer:**
A function provided by createAsyncThunk to return error data in a rejected action.

```typescript
catch (error) {
  return rejectWithValue(getErrorMessage(error));
}
```

This puts the error message in `action.payload` so I can display it to users.

---

## Q3.8: "Why Redux Toolkit instead of plain Redux?"

**Answer:**
Redux Toolkit simplifies Redux:
- Less boilerplate code
- Built-in Immer for immutable updates
- `createAsyncThunk` for async logic
- `createSlice` combines reducer + actions
- Better TypeScript support

---

## Q3.9: "What is the initial state in your auth slice?"

**Answer:**
```typescript
const initialState: AuthState = {
  user: null,      // No user logged in
  profile: null,   // No profile data
  loading: false,  // Not loading
  error: null,     // No error
};
```

This is the default state when the app first loads.

---

## Q3.10: "How do you handle loading states?"

**Answer:**
Each slice has a `loading` boolean:
1. Set `loading: true` in the `pending` case
2. Set `loading: false` in `fulfilled` and `rejected` cases
3. Components check `loading` to show spinners

```typescript
{loading && <Spinner />}
{!loading && <Content />}
```

---

# 4. TYPESCRIPT QUESTIONS

## Q4.1: "What is TypeScript and why use it?"

**Answer:**
TypeScript is JavaScript with static type checking. Benefits:
- Catches errors at compile time (before running)
- Better IDE autocomplete and refactoring
- Self-documenting code
- Safer refactoring

Example: If I try `blog.titlee` (typo), TypeScript shows an error immediately.

---

## Q4.2: "What is an interface?"

**Answer:**
An interface defines the shape of an object - what properties it has and their types.

```typescript
export interface Blog {
  id: string;
  title: string;
  content: string;
  author_id: string | null;
  view_count: number;
  image_urls: string[];
}
```

Now TypeScript knows exactly what a Blog object should look like.

---

## Q4.3: "What does `string | null` mean?"

**Answer:**
It's a union type - the value can be EITHER a string OR null.

```typescript
author_id: string | null;
```

This is used for guest posts where there's no real user ID.

---

## Q4.4: "What does the `?` mean in types?"

**Answer:**
It marks a property as optional - it may or may not exist.

```typescript
like_count?: number;  // Optional property
```

This is the same as `like_count: number | undefined`.

---

## Q4.5: "What is a generic type?"

**Answer:**
A type that takes another type as a parameter.

```typescript
const [view, setView] = useState<View>('login');
```

`useState<View>` means "this state holds a value of type View."

---

## Q4.6: "What is type inference?"

**Answer:**
TypeScript automatically figures out types when you don't specify them.

```typescript
const name = "John";  // TypeScript infers: string
const count = 5;      // TypeScript infers: number
```

But sometimes you need explicit types for clarity or when TypeScript can't infer correctly.

---

## Q4.7: "What is the `as` keyword?"

**Answer:**
Type assertion - telling TypeScript "trust me, this is this type."

```typescript
return data as Blog;
```

Use it when you know more about the type than TypeScript does.

---

## Q4.8: "What is a type guard?"

**Answer:**
A function that checks and narrows down the type at runtime.

```typescript
export function isSupabaseError(error: unknown): error is SupabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  );
}
```

After calling this, TypeScript knows the error is a SupabaseError.

---

## Q4.9: "What is `RootState` and `AppDispatch`?"

**Answer:**
These are TypeScript types derived from the store:

```typescript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

- `RootState` = The shape of the entire Redux state
- `AppDispatch` = The type of the dispatch function

They ensure type safety when using `useSelector` and `useDispatch`.

---

## Q4.10: "Why use `unknown` instead of `any` for errors?"

**Answer:**
- `any` disables type checking completely
- `unknown` requires you to check the type before using it

```typescript
catch (error: unknown) {
  return rejectWithValue(getErrorMessage(error));  // Safe
}
```

`getErrorMessage` handles the unknown type safely with type guards.

---

# 5. SUPABASE & DATABASE QUESTIONS

## Q5.1: "What is Supabase?"

**Answer:**
Supabase is a Backend-as-a-Service that provides:
- **PostgreSQL database** - stores all my data
- **Authentication** - handles user signup/login
- **Storage** - stores uploaded images
- **Auto-generated API** - REST API for database operations

It's like Firebase but uses PostgreSQL instead of NoSQL.

---

## Q5.2: "Explain your database schema"

**Answer:**
I have 4 main tables:

1. **profiles** - User profile data (username, avatar)
2. **blogs** - Blog posts (title, content, images, author)
3. **comments** - Comments on blogs
4. **blog_likes** - Tracks who liked which blog

Plus a **view** called `blogs_with_counts` that joins blogs with like/comment counts.

---

## Q5.3: "What is a primary key?"

**Answer:**
A unique identifier for each row. I use UUIDs:

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

Every blog has a unique ID like `550e8400-e29b-41d4-a716-446655440000`.

---

## Q5.4: "What is a foreign key?"

**Answer:**
A reference to another table's primary key. It creates a relationship.

```sql
blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE
```

This means comments.blog_id must match an existing blogs.id.

---

## Q5.5: "What does ON DELETE CASCADE mean?"

**Answer:**
When the referenced row is deleted, also delete this row.

```sql
blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE
```

If a blog is deleted, all its comments are automatically deleted too.

---

## Q5.6: "What does ON DELETE SET NULL mean?"

**Answer:**
When the referenced row is deleted, set this field to NULL instead of deleting.

```sql
author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
```

If a user is deleted, their blogs remain but author_id becomes NULL.

---

## Q5.7: "What is Row Level Security (RLS)?"

**Answer:**
Database-level security that controls access to individual rows.

```sql
CREATE POLICY "Users can update their own blogs"
  ON blogs FOR UPDATE
  USING (auth.uid() = author_id);
```

This means you can only UPDATE blogs where your user ID matches the author_id - even if you have direct database access.

---

## Q5.8: "What is `auth.uid()`?"

**Answer:**
A Supabase function that returns the currently authenticated user's ID. Used in RLS policies:

```sql
USING (auth.uid() = author_id)
```

"Allow this action if the logged-in user's ID matches the author_id"

---

## Q5.9: "Why did you create a database VIEW?"

**Answer:**
The `blogs_with_counts` view joins multiple tables and calculates aggregates:

```sql
CREATE VIEW blogs_with_counts AS
SELECT b.*,
  COUNT(likes) as like_count,
  COUNT(comments) as comment_count,
  profiles.username, profiles.avatar_url
FROM blogs b
LEFT JOIN ...
```

Instead of multiple queries, I query the view once and get everything.

---

## Q5.10: "What is a database INDEX?"

**Answer:**
An index speeds up queries on a column - like the index in a book.

```sql
CREATE INDEX idx_comments_blog_id ON comments(blog_id);
```

When fetching comments for a blog, the database can find them faster without scanning every row.

---

## Q5.11: "What is a database TRIGGER?"

**Answer:**
Automatic code that runs when something happens in the database.

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

When a new user signs up, this automatically creates their profile.

---

## Q5.12: "What is COALESCE?"

**Answer:**
Returns the first non-null value.

```sql
COALESCE(like_count, 0)
```

If like_count is NULL, return 0 instead.

---

## Q5.13: "What is a TEXT[] type?"

**Answer:**
An array of text values. I use it for image URLs:

```sql
image_urls TEXT[] DEFAULT '{}'
```

This stores multiple image URLs in a single column: `['url1', 'url2', 'url3']`

---

## Q5.14: "Why no foreign key on comments.author_id?"

**Answer:**
To allow guest comments. If there was a foreign key, every comment would require a valid user account.

```sql
-- No foreign key constraint here
author_id UUID,
```

Guest comments have `author_id: null` and `is_guest_comment: true`.

---

## Q5.15: "What is UNIQUE constraint?"

**Answer:**
Ensures no duplicate combinations.

```sql
UNIQUE(blog_id, user_id)
```

On blog_likes, this prevents a user from liking the same blog twice.

---

# 6. AUTHENTICATION QUESTIONS

## Q6.1: "How does user registration work?"

**Answer:**
1. User enters email, password, username
2. Frontend calls `supabase.auth.signUp()` with the data
3. Supabase creates the user in `auth.users`
4. A database trigger automatically creates their profile
5. Redux stores the user and profile data
6. UI redirects to profile setup or blog list

---

## Q6.2: "How does login work?"

**Answer:**
1. User enters email and password
2. `dispatch(login({ email, password }))` is called
3. Thunk calls `supabase.auth.signInWithPassword()`
4. Supabase verifies credentials and returns user + session
5. Thunk also fetches the user's profile
6. Redux stores user and profile
7. App.tsx's useEffect detects user change and redirects to blog list

---

## Q6.3: "How do you persist the login session?"

**Answer:**
Supabase handles this automatically:
- Stores JWT token in localStorage
- Refreshes token when it expires
- `supabase.auth.getUser()` retrieves the current session

On app load, I call `checkAuth` which calls `getUser()` to restore the session.

---

## Q6.4: "How does guest login work?"

**Answer:**
1. User clicks "Continue as Guest"
2. I generate a fake user object with `isGuest: true`
3. Store it in localStorage (not Supabase)
4. Redux treats it like a real user

```typescript
const guestUser = {
  id: generateGuestUUID(),
  email: 'guest@anonymous.com',
  isGuest: true,
};
localStorage.setItem('guestUser', JSON.stringify(guestUser));
```

---

## Q6.5: "How do you check if someone is a guest?"

**Answer:**
The user object has an `isGuest` flag:

```typescript
if (user?.isGuest) {
  // Guest user logic
}
```

This is used to:
- Show different UI
- Prevent liking posts (guests can't like)
- Set `is_guest_post: true` on their content

---

## Q6.6: "How does logout work?"

**Answer:**
```typescript
export const logout = createAsyncThunk('auth/logout', async () => {
  const guestUser = localStorage.getItem('guestUser');

  if (guestUser) {
    localStorage.removeItem('guestUser');  // Clear guest data
  } else {
    await supabase.auth.signOut();  // Clear Supabase session
  }
});
```

Then Redux clears user and profile from state.

---

## Q6.7: "How do you protect routes/pages?"

**Answer:**
Using conditional rendering in App.tsx:

```typescript
{user && view === 'create' && <CreateBlog />}
```

CreateBlog only renders if `user` exists. If someone tries to access it without logging in, they just see the login page.

---

# 7. IMAGE HANDLING QUESTIONS

## Q7.1: "How do you handle image uploads?"

**Answer:**
1. User selects images via the ImageUpload component
2. Images are stored in React state as File objects
3. On form submit, images are compressed client-side
4. Compressed images upload to Supabase Storage in parallel
5. Storage returns public URLs
6. URLs are saved in the blog/comment record

---

## Q7.2: "Why do you compress images?"

**Answer:**
- Reduces upload time
- Saves storage space and bandwidth
- Faster page loads for users
- Stays within Supabase free tier limits

I use `browser-image-compression` library with:
- Max size: 1MB
- Max dimension: 1920px

---

## Q7.3: "What is a WebWorker?"

**Answer:**
A background thread that runs JavaScript without blocking the main UI thread.

```typescript
const compressedImage = await compressImage(image, {
  useWebWorker: true,  // Compress in background
});
```

Without WebWorker, compressing large images would freeze the UI.

---

## Q7.4: "How do you upload multiple images?"

**Answer:**
Using `Promise.all` to upload in parallel:

```typescript
const uploadPromises = images.map(image => uploadSingleImage(image));
const results = await Promise.all(uploadPromises);
```

This uploads all images simultaneously instead of one at a time.

---

## Q7.5: "How do you generate unique filenames?"

**Answer:**
Combining userId, timestamp, and random string:

```typescript
const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
// Result: "user123/1706547890123-abc7xyz.jpg"
```

This prevents overwriting existing files.

---

## Q7.6: "How do you handle failed uploads?"

**Answer:**
The upload function returns null for failures, then filters them out:

```typescript
const results = await Promise.all(uploadPromises);
return results.filter(url => url !== null);
```

Successful uploads continue even if some fail.

---

## Q7.7: "Where are images stored?"

**Answer:**
Supabase Storage in a bucket called `blog-images`. The bucket is public so images can be displayed without authentication.

---

# 8. PERFORMANCE & OPTIMIZATION QUESTIONS

## Q8.1: "How do you optimize rendering?"

**Answer:**
1. **useMemo** for expensive calculations (filtering/sorting blogs)
2. **useCallback** for functions passed to children
3. **Conditional rendering** to only render what's needed
4. **Loading skeletons** for perceived performance

---

## Q8.2: "What is memoization?"

**Answer:**
Caching the result of a function so it doesn't recalculate unnecessarily.

```typescript
const filtered = useMemo(() => {
  return blogs.filter(...).sort(...);
}, [blogs, sortBy]);
```

Only recalculates when `blogs` or `sortBy` change.

---

## Q8.3: "Why use loading skeletons?"

**Answer:**
Skeletons show the shape of content while loading. Benefits:
- Better perceived performance
- Reduces layout shift
- User knows content is coming

```typescript
{loading ? <BlogCardSkeleton /> : <BlogCard blog={blog} />}
```

---

## Q8.4: "How does parallel image upload improve performance?"

**Answer:**
Sequential: Upload A (2s) → Upload B (2s) → Upload C (2s) = 6 seconds
Parallel: Upload A, B, C simultaneously = ~2 seconds (bottleneck is slowest)

`Promise.all` makes them run at the same time.

---

## Q8.5: "Why use a database view instead of multiple queries?"

**Answer:**
Single query vs multiple:
- **With view**: 1 query gets blogs + likes + comments + profile
- **Without view**: 4 separate queries, then combine in JavaScript

Fewer round trips = faster response.

---

## Q8.6: "Why create database indexes?"

**Answer:**
Indexes speed up WHERE clauses and JOINs:

```sql
CREATE INDEX idx_comments_blog_id ON comments(blog_id);
```

Finding all comments for a blog goes from O(n) to O(log n).

---

# 9. SECURITY QUESTIONS

## Q9.1: "How do you protect against unauthorized access?"

**Answer:**
Multiple layers:
1. **Frontend**: Conditional rendering hides UI from non-logged-in users
2. **Redux**: State checks before dispatching actions
3. **Database**: RLS policies enforce rules at database level

Even if someone bypasses the frontend, RLS prevents unauthorized database operations.

---

## Q9.2: "How does RLS protect data?"

**Answer:**
RLS policies run on every database operation:

```sql
CREATE POLICY "Users can update their own blogs"
  ON blogs FOR UPDATE
  USING (auth.uid() = author_id);
```

Even with direct database access, you can only update rows where you're the author.

---

## Q9.3: "How do you prevent SQL injection?"

**Answer:**
Supabase client uses parameterized queries:

```typescript
supabase.from('blogs').select('*').eq('id', blogId)
```

The `blogId` is passed as a parameter, not concatenated into the query string.

---

## Q9.4: "How do you store passwords?"

**Answer:**
I don't - Supabase handles it. Passwords are hashed using bcrypt before storage. I never see or store plain text passwords.

---

## Q9.5: "What is SECURITY DEFINER?"

**Answer:**
A function that runs with the creator's permissions, not the caller's.

```sql
CREATE FUNCTION increment_blog_views(blog_id UUID)
SECURITY DEFINER
AS $$
  UPDATE blogs SET view_count = view_count + 1 WHERE id = blog_id;
$$;
```

This allows the view count to update even when RLS would normally block it.

---

## Q9.6: "How do you validate user input?"

**Answer:**
Frontend validation before submission:

```typescript
// Email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  setError('Invalid email');
  return;
}

// Required fields
if (!title.trim() || !content.trim()) {
  setError('Title and content required');
  return;
}
```

---

## Q9.7: "How do you handle environment variables?"

**Answer:**
Sensitive values are in `.env` file:

```
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_ANON_KEY=...
```

- `.env` is in `.gitignore` (never committed)
- `REACT_APP_` prefix makes them available in React
- They're embedded in the build (public, but that's ok for anon key)

---

# 10. CODE WALKTHROUGH QUESTIONS

## Q10.1: "Walk me through what happens when the app loads"

**Answer:**
1. `index.tsx` renders `App` wrapped in Redux `Provider`
2. `App` component mounts
3. `useEffect` dispatches `checkAuth()`
4. `checkAuth` checks localStorage for guest user
5. If no guest, checks Supabase for authenticated session
6. If user found, also fetches their profile
7. Redux updates `user` and `profile` state
8. Second `useEffect` sees user changed, updates `view` state
9. Conditional rendering shows appropriate component (login or blog list)

---

## Q10.2: "Walk me through the login flow"

**Answer:**
1. User on Login component enters email/password
2. Clicks submit, `handleSubmit` runs
3. Frontend validation (empty fields, email format)
4. `dispatch(login({ email, password }))`
5. `login.pending` → `loading: true`, show spinner
6. Supabase verifies credentials
7. If success: fetch profile, return user
8. `login.fulfilled` → `loading: false`, save user
9. App.tsx's useEffect detects user, changes view to 'list'
10. BlogList component renders, fetches blogs

---

## Q10.3: "Walk me through creating a blog post"

**Answer:**
1. User fills in title, content, optionally adds images
2. Clicks "Publish Post"
3. `handleSubmit` prevents default, dispatches `createBlog`
4. Thunk checks if user is guest or authenticated
5. If images exist, compress and upload in parallel
6. Build blog object with author info and image URLs
7. Insert into `blogs` table via Supabase
8. `createBlog.fulfilled` adds blog to Redux state
9. `onBack()` navigates to blog list
10. New blog appears at top (sorted by newest)

---

## Q10.4: "Walk me through the like functionality"

**Answer:**
1. User clicks like button on ViewBlog
2. Check if user is logged in and not guest
3. `dispatch(likeBlog(blogId))`
4. Thunk inserts into `blog_likes` table
5. Local state updates immediately (optimistic UI)
6. If error, show message and revert
7. Database's UNIQUE constraint prevents duplicate likes

---

## Q10.5: "Walk me through deleting a comment"

**Answer:**
1. User clicks delete on their comment
2. `window.confirm()` asks for confirmation
3. If yes, `dispatch(deleteComment(commentId))`
4. Thunk calls `supabase.from('comments').delete().eq('id', commentId)`
5. RLS policy checks if user owns the comment
6. If authorized, comment is deleted
7. `deleteComment.fulfilled` removes comment from Redux state
8. UI updates automatically

---

# 11. ARCHITECTURE & DESIGN QUESTIONS

## Q11.1: "Why separate components by feature?"

**Answer:**
Organizing by feature (auth, blog, common) instead of by type (buttons, forms) makes it easier to:
- Find related code
- Understand feature scope
- Work on one feature without touching others
- Delete features cleanly if needed

---

## Q11.2: "Why put all types in one file?"

**Answer:**
Single source of truth for data shapes. Benefits:
- Easy to find type definitions
- Shared types used across slices and components
- Simpler imports

For larger apps, I might split by feature.

---

## Q11.3: "Why use a separate lib folder for Supabase?"

**Answer:**
Separation of concerns:
- Single place to configure the client
- Easy to mock for testing
- If switching providers, only change one file

---

## Q11.4: "How would you scale this application?"

**Answer:**
1. **Add React Router** for proper URL navigation
2. **Add pagination** for large blog lists
3. **Code splitting** with React.lazy for faster initial load
4. **Caching** with React Query or SWR
5. **Move to server components** (Next.js) for better SEO
6. **Add real-time updates** with Supabase Realtime

---

## Q11.5: "What design patterns do you use?"

**Answer:**
1. **Container/Presentational** - Components separated by logic vs display
2. **Composition** - Building complex UIs from simple components
3. **Flux pattern** - Unidirectional data flow with Redux
4. **Module pattern** - Slices encapsulate feature logic

---

# 12. ERROR HANDLING QUESTIONS

## Q12.1: "How do you handle API errors?"

**Answer:**
1. Try-catch in thunks
2. `rejectWithValue` returns error message
3. Redux stores error in state
4. Components display error to user

```typescript
try {
  // API call
} catch (error) {
  return rejectWithValue(getErrorMessage(error));
}
```

---

## Q12.2: "What is the getErrorMessage function?"

**Answer:**
A type-safe function to extract error messages from unknown error types:

```typescript
export function getErrorMessage(error: unknown): string {
  if (isSupabaseError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return String(error);
}
```

It handles Supabase errors, standard errors, and unknown types.

---

## Q12.3: "How do you display errors to users?"

**Answer:**
Store in Redux, display in components:

```typescript
{error && (
  <div className="bg-red-50 text-red-700 p-4 rounded">
    {error}
  </div>
)}
```

---

## Q12.4: "How do you handle network failures?"

**Answer:**
Same error handling path - the catch block captures network errors:

```typescript
catch (error) {
  return rejectWithValue('Network error. Please try again.');
}
```

The loading state returns to false so UI isn't stuck.

---

## Q12.5: "How do you clear errors?"

**Answer:**
Each slice has a `clearError` action:

```typescript
reducers: {
  clearError: (state) => {
    state.error = null;
  },
}
```

Called when navigating away or starting a new action.

---

# 13. TESTING & DEBUGGING QUESTIONS

## Q13.1: "How would you test this application?"

**Answer:**
1. **Unit tests** - Test Redux slices with Jest
2. **Component tests** - Test components with React Testing Library
3. **Integration tests** - Test user flows end-to-end
4. **E2E tests** - Test full app with Cypress or Playwright

Example unit test:
```typescript
test('login.fulfilled sets user', () => {
  const user = { id: '1', email: 'test@test.com' };
  const state = authReducer(initialState, login.fulfilled(user, '', {}));
  expect(state.user).toEqual(user);
});
```

---

## Q13.2: "How do you debug Redux state?"

**Answer:**
Redux DevTools browser extension:
- See every dispatched action
- Inspect state at any point
- Time-travel through state changes
- Export/import state for bug reports

---

## Q13.3: "How do you debug React components?"

**Answer:**
1. React Developer Tools extension
2. Console.log in useEffect
3. Breakpoints in Chrome DevTools
4. Check network tab for API calls

---

## Q13.4: "How do you debug Supabase queries?"

**Answer:**
1. Supabase dashboard shows query logs
2. Check the Network tab for API responses
3. Console.log the data and error from queries:

```typescript
const { data, error } = await supabase.from('blogs').select('*');
console.log({ data, error });
```

---

# 14. IMPROVEMENT & FUTURE FEATURES QUESTIONS

## Q14.1: "What would you add if you had more time?"

**Answer:**
1. **React Router** for proper URL navigation
2. **Real-time updates** using Supabase subscriptions
3. **Rich text editor** for blog content
4. **Categories/tags** for better organization
5. **User following** system
6. **Email notifications** for comments/likes
7. **Unit and integration tests**

---

## Q14.2: "What would you do differently?"

**Answer:**
1. Use React Router from the start
2. Add pagination for blog lists
3. Implement better error boundaries
4. Add loading states at component level, not global
5. Use React Query for data fetching (better caching)

---

## Q14.3: "How would you add real-time updates?"

**Answer:**
Supabase Realtime subscriptions:

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('blogs')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'blogs' },
      (payload) => {
        // Update Redux state based on change type
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

---

## Q14.4: "How would you add pagination?"

**Answer:**
1. Use Supabase's `.range()` for offset pagination:
```typescript
supabase.from('blogs').select('*').range(0, 9)  // First 10
```

2. Store page number in state
3. "Load more" button or infinite scroll
4. Add total count from database

---

## Q14.5: "How would you improve SEO?"

**Answer:**
1. Move to Next.js for server-side rendering
2. Add meta tags dynamically based on blog content
3. Implement proper URL slugs (`/blog/my-post-title`)
4. Add sitemap.xml
5. Implement Open Graph tags for social sharing

---

# FINAL TIP

When you don't know an answer, say:

> "I'm not sure about that specific detail, but here's how I would approach finding out..."

or

> "That's something I haven't implemented yet, but I would research..."

Honesty about what you don't know, combined with problem-solving attitude, is more valuable than guessing.

---

Good luck with your interview! You've got this!
