import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './store/authSlice';
import { AppDispatch, RootState } from './store';
import Navbar from './components/layout/navbar';
import Login from './components/auth/login';
import Register from './components/auth/register';
import BlogList from './components/blog/bloglist';
import CreateBlog from './components/blog/createblog';
import ViewBlog from './components/blog/viewblog';
import EditBlog from './components/blog/editblog';

type View = 'login' | 'register' | 'list' | 'create' | 'view' | 'edit';

function App() {
  const [view, setView] = useState<View>('login');
  const [selectedBlogId, setSelectedBlogId] = useState<string>('');
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

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

  const handleViewBlog = (id: string) => {
    setSelectedBlogId(id);
    setView('view');
  };

  const handleEditBlog = (id: string) => {
    setSelectedBlogId(id);
    setView('edit');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {user && <Navbar onNavigate={setView as any} />}
      {!user && view === 'login' && (
        <Login onSwitchToRegister={() => setView('register')} />
      )}
      {!user && view === 'register' && (
        <Register onSwitchToLogin={() => setView('login')} />
      )}
      {user && view === 'list' && <BlogList onViewBlog={handleViewBlog} />}
      {user && view === 'create' && <CreateBlog onBack={() => setView('list')} />}
      {user && view === 'view' && (
        <ViewBlog
          blogId={selectedBlogId}
          onBack={() => setView('list')}
          onEdit={handleEditBlog}
        />
      )}
      {user && view === 'edit' && (
        <EditBlog
          blogId={selectedBlogId}
          onBack={() => setView('view')}
        />
      )}
    </div>
  );
}

export default App;