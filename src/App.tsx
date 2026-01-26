import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { checkAuth, logout } from './store/authSlice';
import Navbar from './components/layout/navbar';
import Register from './components/auth/register';
import Login from './components/auth/login';
import BlogList from './components/blog/bloglist';
import CreateBlog from './components/blog/createblog';
import ViewBlog from './components/blog/viewblog';
import EditBlog from './components/blog/editblog';
import ProfileSetup from './components/profile/profilesetup';

type View = 'login' | 'register' | 'list' | 'create' | 'view' | 'edit' | 'profile';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, profile, loading } = useSelector((state: RootState) => state.auth);
  const [view, setView] = useState<View>('login');
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    dispatch(checkAuth()).finally(() => {
      setIsInitialLoad(false);
    });
  }, [dispatch]);

  useEffect(() => {
    // Don't change views during initial load
    if (isInitialLoad) return;

    if (user) {
      // If user is not a guest and doesn't have a profile username, show profile setup
      if (!user.isGuest && (!profile || !profile.username)) {
        setView('profile');
      } else if (view === 'login' || view === 'register' || view === 'profile') {
        // Only redirect to list if coming from auth or profile pages
        setView('list');
      }
      // Otherwise, keep the current view (e.g., if viewing a specific blog)
    } else {
      setView('login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile, isInitialLoad]);

  const handleLogout = async () => {
    await dispatch(logout());
    setView('login');
  };

  const handleViewBlog = (id: string) => {
    setSelectedBlogId(id);
    setView('view');
  };

  const handleEditBlog = () => {
    setView('edit');
  };

  const handleProfileComplete = () => {
    setView('list');
  };

  if (loading || isInitialLoad) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={user}
        profile={profile}
        onLogout={handleLogout}
        onNavigate={(newView) => setView(newView as View)}
      />
      
      {!user && view === 'login' && (
        <Login onSwitchToRegister={() => setView('register')} />
      )}
      {!user && view === 'register' && (
        <Register onSwitchToLogin={() => setView('login')} />
      )}
      {user && view === 'profile' && (
        <ProfileSetup onComplete={handleProfileComplete} />
      )}
      {user && (profile?.username || user.isGuest) && view === 'list' && (
        <BlogList 
          onViewBlog={handleViewBlog}
          onCreateBlog={() => setView('create')}
        />
      )}
      {user && (profile?.username || user.isGuest) && view === 'create' && (
        <CreateBlog onBack={() => setView('list')} />
      )}
      {user && (profile?.username || user.isGuest) && view === 'view' && selectedBlogId && (
        <ViewBlog
          blogId={selectedBlogId}
          onBack={() => setView('list')}
          onEdit={handleEditBlog}
        />
      )}
      {user && (profile?.username || user.isGuest) && view === 'edit' && selectedBlogId && (
        <EditBlog
          blogId={selectedBlogId}
          onBack={() => setView('list')}
        />
      )}
    </div>
  );
}

export default App;