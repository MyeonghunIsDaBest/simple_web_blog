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
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await dispatch(deleteBlog(blogId)).unwrap();
        onBack();
      } catch (err) {
        console.error('Failed to delete post:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading post...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-700">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!currentBlog) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-gray-600">Post not found</div>
      </div>
    );
  }

  const isAuthor = user?.id === currentBlog.author_id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <button
          onClick={onBack}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm"
        >
          ← Back to All Posts
        </button>

        <article className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{currentBlog.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>{currentBlog.author_email || 'Anonymous'}</span>
                {currentBlog.is_guest_post && (
                  <>
                    <span>•</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">
                      Guest
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {isAuthor && (
              <div className="flex gap-2 ml-4">
                <button
                  onClick={onEdit}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 mb-6 pb-6 border-b border-gray-200">
            <div>Published {new Date(currentBlog.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
            {currentBlog.updated_at && currentBlog.updated_at !== currentBlog.created_at && (
              <div className="mt-1">
                Updated {new Date(currentBlog.updated_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            )}
          </div>

          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {currentBlog.content}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ViewBlog;