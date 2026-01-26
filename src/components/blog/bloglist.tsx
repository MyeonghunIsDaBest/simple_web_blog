import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs } from '../../store/blogSlice';
import { RootState, AppDispatch } from '../../store';
import BlogCard from './BlogCard';
import BlogCardSkeleton from '../common/BlogCardSkeleton';

interface BlogListProps {
  onViewBlog: (id: string) => void;
  onCreateBlog: () => void;
}

const BlogList: React.FC<BlogListProps> = ({ onViewBlog, onCreateBlog }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { blogs, loading, error } = useSelector((state: RootState) => state.blog);
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  const handleBlogClick = useCallback((id: string) => {
    onViewBlog(id);
  }, [onViewBlog]);

  if (loading && blogs.length === 0) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className={`text-3xl font-bold transition-colors ${
                isDark ? 'text-gray-100' : 'text-gray-900'
              }`}>
                All Posts
              </h1>
              <p className={`mt-1 transition-colors ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Loading stories from our community...
              </p>
            </div>
            <button
              disabled
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm shadow-sm opacity-50 cursor-not-allowed"
            >
              New Post
            </button>
          </div>
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <BlogCardSkeleton key={index} isDark={isDark} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex justify-center items-center min-h-screen transition-colors ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className={`rounded-lg p-6 text-center max-w-md ${
          isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
        } border`}>
          <div className={isDark ? 'text-red-400' : 'text-red-700'}>Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold transition-colors ${
              isDark ? 'text-gray-100' : 'text-gray-900'
            }`}>
              All Posts
            </h1>
            <p className={`mt-1 transition-colors ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Read stories from our community
            </p>
          </div>
          <button
            onClick={onCreateBlog}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all font-medium text-sm shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            New Post
          </button>
        </div>

        {blogs.length === 0 ? (
          <div className={`text-center py-20 rounded-lg shadow-sm border transition-colors ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="text-5xl mb-4">📝</div>
            <p className={`text-xl mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              No posts yet
            </p>
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              Be the first to share something!
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {blogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                isDark={isDark}
                onClick={handleBlogClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;