import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlog, deleteBlog } from '../../store/blogSlice';
import { AppDispatch, RootState } from '../../store';

interface ViewBlogProps {
  blogId: string;
  onBack: () => void;
  onEdit: () => void;
}

const ViewBlog: React.FC<ViewBlogProps> = ({ blogId, onBack, onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentBlog, loading, error } = useSelector((state: RootState) => state.blog);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchBlog(blogId));
  }, [dispatch, blogId]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await dispatch(deleteBlog(blogId)).unwrap();
        onBack();
      } catch (err) {
        console.error('Failed to delete blog:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!currentBlog) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Blog not found</div>
      </div>
    );
  }

  const isAuthor = user?.id === currentBlog.author_id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        onClick={onBack}
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2"
      >
        ← Back to Blogs
      </button>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold mb-4">{currentBlog.title}</h1>
        
        <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
          <div>
            <p>Author: {currentBlog.author_email || 'Anonymous'}</p>
            <p>Created: {new Date(currentBlog.created_at).toLocaleDateString()}</p>
            {currentBlog.updated_at && currentBlog.updated_at !== currentBlog.created_at && (
              <p>Updated: {new Date(currentBlog.updated_at).toLocaleDateString()}</p>
            )}
          </div>
          
          {isAuthor && (
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {currentBlog.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBlog;