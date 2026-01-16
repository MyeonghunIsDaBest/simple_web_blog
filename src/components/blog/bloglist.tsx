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
            {blogs.map((blog: Blog) => {
              // Get avatar from either author_avatar_url (from view) or author_avatar (alias)
              const avatarUrl = blog.author_avatar_url || blog.author_avatar;
              // Get username from profile or fallback to author_username
              const displayUsername = blog.author_username_profile || blog.author_username || blog.author_email || 'Anonymous';
              
              return (
                <div
                  key={blog.id}
                  className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer overflow-hidden"
                  onClick={() => handleBlogClick(blog.id)}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={displayUsername}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {displayUsername}
                          </span>
                          {blog.is_guest_post && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-medium">
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

                    <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {blog.title}
                    </h2>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
                      {blog.content}
                    </p>

                    {blog.image_urls && blog.image_urls.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {blog.image_urls.slice(0, 2).map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Post image ${index + 1}`}
                              className="w-full h-32 object-cover rounded border border-gray-200"
                            />
                            {index === 1 && blog.image_urls!.length > 2 && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                                <span className="text-white font-medium text-lg">
                                  +{blog.image_urls!.length - 2}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Show like and comment counts if available */}
                    {(blog.like_count !== undefined || blog.comment_count !== undefined) && (
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                        {blog.like_count !== undefined && blog.like_count > 0 && (
                          <span>❤️ {blog.like_count}</span>
                        )}
                        {blog.comment_count !== undefined && blog.comment_count > 0 && (
                          <span>💬 {blog.comment_count}</span>
                        )}
                        {blog.view_count > 0 && (
                          <span>👁️ {blog.view_count}</span>
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