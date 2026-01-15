import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs } from '../../store/blogSlice';
import { RootState, AppDispatch } from '../../store';
import { Blog } from '../../types/';

interface BlogListProps {
  onViewBlog: (id: string) => void;
  onCreateBlog: () => void;
}

const BlogList: React.FC<BlogListProps> = ({ onViewBlog, onCreateBlog }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { blogs, loading, error } = useSelector((state: RootState) => state.blog);

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  const handleBlogClick = (id: string) => {
    onViewBlog(id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading posts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <div className="text-red-700">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              All Posts
            </h1>
            <p className="text-gray-600 mt-1">Read stories from our community</p>
          </div>
          <button
            onClick={onCreateBlog}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            New Post
          </button>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-xl text-gray-700 mb-2">No posts yet</p>
            <p className="text-gray-500">Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog: Blog) => (
              <div
                key={blog.id}
                className="bg-white border border-gray-200 p-6 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => handleBlogClick(blog.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-semibold text-gray-900 line-clamp-2 flex-1">
                    {blog.title}
                  </h2>
                  {blog.is_guest_post && (
                    <span className="ml-3 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium whitespace-nowrap">
                      Guest
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                  {blog.content}
                </p>
                
                <div className="flex items-center text-xs text-gray-500 gap-4">
                  <span>{blog.author_email || 'Anonymous'}</span>
                  <span>•</span>
                  <span>{new Date(blog.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;