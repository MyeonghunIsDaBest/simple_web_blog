import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs } from '../../store/blogSlice';
import { RootState, AppDispatch } from '../../store';
import BlogCard from './BlogCard';
import BlogBoardCard from './BlogBoardCard';
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
  
  // State for filtering and sorting
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'most_comments'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'with_images' | 'guest_posts'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  const handleBlogClick = useCallback((id: string) => {
    onViewBlog(id);
  }, [onViewBlog]);

  // Filter and sort blogs
  const filteredAndSortedBlogs = useMemo(() => {
    let filtered = [...blogs];
    
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
  }, [blogs, sortBy, filterBy, searchQuery]);

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
      isDark ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-blue-50 via-white to-purple-50'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-6">
            <div>
              <h1 className={`text-4xl font-bold bg-gradient-to-r ${
                isDark 
                  ? 'from-gray-100 to-gray-300' 
                  : 'from-gray-900 to-gray-700'
              } bg-clip-text text-transparent mb-2`}>
                Discover Stories
              </h1>
              <p className={`text-lg ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Explore {filteredAndSortedBlogs.length} amazing posts from our community
              </p>
            </div>
            <button
              onClick={onCreateBlog}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Post
            </button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="md:col-span-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>

            {/* Filter Dropdown */}
            <div>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="all">All Posts</option>
                <option value="with_images">With Images</option>
                <option value="guest_posts">Guest Posts</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="most_comments">Most Comments</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div>
              <div className={`flex rounded-xl border overflow-hidden ${
                isDark ? 'border-gray-700' : 'border-gray-300'
              }`}>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-4 py-3 font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    viewMode === 'list'
                      ? isDark
                        ? 'bg-gray-700 text-gray-100'
                        : 'bg-gray-200 text-gray-900'
                      : isDark
                        ? 'bg-gray-800 text-gray-400 hover:text-gray-200'
                        : 'bg-white text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  onClick={() => setViewMode('board')}
                  className={`flex-1 px-4 py-3 font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    viewMode === 'board'
                      ? isDark
                        ? 'bg-gray-700 text-gray-100'
                        : 'bg-gray-200 text-gray-900'
                      : isDark
                        ? 'bg-gray-800 text-gray-400 hover:text-gray-200'
                        : 'bg-white text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  <span className="hidden sm:inline">Board</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading && blogs.length === 0 ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <BlogCardSkeleton key={index} isDark={isDark} />
            ))}
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-20">
            <div className={`rounded-2xl p-8 text-center max-w-md ${
              isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
            } border`}>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className={`text-lg font-semibold mb-2 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                Oops! Something went wrong
              </div>
              <div className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                {error}
              </div>
            </div>
          </div>
        ) : filteredAndSortedBlogs.length === 0 ? (
          <div className={`text-center py-20 rounded-2xl shadow-lg border transition-colors ${
            isDark ? 'bg-gray-800/50 border-gray-700 backdrop-blur-sm' : 'bg-white/80 border-gray-200 backdrop-blur-sm'
          }`}>
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className={`w-10 h-10 ${isDark ? 'text-gray-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12a8 8 0 10-8 8 7.962 7.962 0 01-5.291-2z" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {searchQuery || filterBy !== 'all' ? 'No posts match your criteria' : 'No posts yet'}
            </h3>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchQuery || filterBy !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Be the first to share something amazing!'
              }
            </p>
            {!searchQuery && filterBy === 'all' && (
              <button
                onClick={onCreateBlog}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-semibold"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Create the First Post
              </button>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAndSortedBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                isDark={isDark}
                onClick={handleBlogClick}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedBlogs.map((blog, index) => (
              <BlogBoardCard
                key={blog.id}
                blog={blog}
                isDark={isDark}
                onClick={handleBlogClick}
                colorIndex={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;