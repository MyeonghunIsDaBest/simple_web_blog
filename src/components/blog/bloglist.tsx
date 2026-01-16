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
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm hover:shadow-md"
          >
            New Post
          </button>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-xl text-gray-700 mb-2">No posts yet</p>
            <p className="text-gray-500">Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {blogs.map((blog: Blog) => {
              const avatarUrl = blog.author_avatar_url || blog.author_avatar;
              const displayUsername = blog.author_username_profile || blog.author_username || blog.author_email || 'Anonymous';
              
              return (
                <div
                  key={blog.id}
                  className="bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                  onClick={() => handleBlogClick(blog.id)}
                >
                  <div className="p-6">
                    {/* Author Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={displayUsername}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {displayUsername}
                          </span>
                          {blog.is_guest_post && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
                              Guest
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(blog.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                      {blog.title}
                    </h2>
                    
                    {/* Content Preview */}
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                      {blog.content}
                    </p>

                    {/* Images - Centered Layout */}
                    {blog.image_urls && blog.image_urls.length > 0 && (
                      <div className="mt-4 mb-3">
                        {blog.image_urls.length === 1 ? (
                          // Single image - centered
                          <div className="flex justify-center">
                            <div className="max-w-2xl w-full">
                              <img
                                src={blog.image_urls[0]}
                                alt="Post image"
                                className="w-full h-auto max-h-96 object-contain rounded-lg border border-gray-200 shadow-sm"
                              />
                            </div>
                          </div>
                        ) : blog.image_urls.length === 2 ? (
                          // Two images - side by side centered
                          <div className="flex justify-center gap-3">
                            {blog.image_urls.map((url, index) => (
                              <div key={index} className="w-[48%] max-w-sm">
                                <img
                                  src={url}
                                  alt={`Post ${index + 1}`}
                                  className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Three or more images - grid layout centered
                          <div className="flex justify-center">
                            <div className="grid grid-cols-2 gap-2 max-w-lg w-full">
                              {blog.image_urls.slice(0, 4).map((url, index) => (
                                <div key={index} className="relative aspect-square">
                                  <img
                                    src={url}
                                    alt={`Post ${index + 1}`}
                                    className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm"
                                  />
                                  {index === 3 && blog.image_urls!.length > 4 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center backdrop-blur-sm">
                                      <span className="text-white font-bold text-2xl">
                                        +{blog.image_urls!.length - 4}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    {(blog.like_count !== undefined || blog.comment_count !== undefined || blog.view_count > 0) && (
                      <div className="flex items-center gap-5 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                        {blog.like_count !== undefined && blog.like_count > 0 && (
                          <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                            <span className="text-base">👍</span>
                            <span className="font-medium">{blog.like_count}</span>
                          </span>
                        )}
                        {blog.comment_count !== undefined && blog.comment_count > 0 && (
                          <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                            <span className="text-base">💬</span>
                            <span className="font-medium">{blog.comment_count}</span>
                          </span>
                        )}
                        {blog.view_count > 0 && (
                          <span className="flex items-center gap-1.5">
                            <span className="text-base">👁️</span>
                            <span className="font-medium">{blog.view_count}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;