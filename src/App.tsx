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

type View = 'login' | 'register' | 'list' | 'create' | 'view' | 'edit';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const [view, setView] = useState<View>('login');
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setView('list');
    } else {
      setView('login');
    }
  }, [user]);

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

  if (loading) {
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
        onLogout={handleLogout}
        onNavigate={(newView) => setView(newView as View)}
      />
      
      {!user && view === 'login' && (
        <Login onSwitchToRegister={() => setView('register')} />
      )}
      {!user && view === 'register' && (
        <Register onSwitchToLogin={() => setView('login')} />
      )}
      {user && view === 'list' && (
        <BlogList 
          onViewBlog={handleViewBlog}
          onCreateBlog={() => setView('create')}
        />
      )}
      {user && view === 'create' && <CreateBlog onBack={() => setView('list')} />}
      {user && view === 'view' && selectedBlogId && (
        <ViewBlog
          blogId={selectedBlogId}
          onBack={() => setView('list')}
          onEdit={handleEditBlog}
        />
      )}
      {user && view === 'edit' && selectedBlogId && (
        <EditBlog
          blogId={selectedBlogId}
          onBack={() => setView('list')}
        />
      )}
    </div>
  );
}

export default App;