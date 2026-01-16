import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs } from '../../store/blogSlice';
import { RootState, AppDispatch } from '../../store';
import { Blog } from '../../types/';

interface BlogListProps {
  onViewBlog: (id: string) => void;
  onCreateBlog: () => void;
}

const POSTS_PER_PAGE = 10;

const BlogList: React.FC<BlogListProps> = ({ onViewBlog, onCreateBlog }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { blogs, loading, error } = useSelector((state: RootState) => state.blog);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  const handleBlogClick = (id: string) => {
    onViewBlog(id);
  };

  // Calculate pagination
  const totalPages = Math.ceil(blogs.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentBlogs = blogs.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <p className="text-gray-600 mt-1">
              {blogs.length} {blogs.length === 1 ? 'post' : 'posts'} total
            </p>
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
          <>
            <div className="space-y-4 mb-8">
              {currentBlogs.map((blog: Blog) => (
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageClick(page)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}

            <div className="text-center text-sm text-gray-500 mt-4">
              Showing {startIndex + 1}-{Math.min(endIndex, blogs.length)} of {blogs.length} posts
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BlogList;