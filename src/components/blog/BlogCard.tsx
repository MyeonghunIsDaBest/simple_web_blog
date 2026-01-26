import React from 'react';
import { Blog } from '../../types';

interface BlogCardProps {
  blog: Blog;
  isDark: boolean;
  onClick: (id: string) => void;
}

const BlogCard: React.FC<BlogCardProps> = React.memo(({ blog, isDark, onClick }) => {
  const avatarUrl = blog.author_avatar_url || blog.author_avatar;
  const displayUsername = blog.author_username_profile || blog.author_username || blog.author_email || 'Anonymous';

  return (
    <div
      className={`rounded-xl overflow-hidden cursor-pointer transition-all duration-300 shadow-sm hover:shadow-lg border ${
        isDark
          ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:-translate-y-1'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:-translate-y-1'
      }`}
      onClick={() => onClick(blog.id)}
    >
      <div className="p-6">
        {/* Author Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm ${
            isDark ? 'bg-blue-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'
          }`}>
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
              <span className={`font-semibold transition-colors ${
                isDark ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {displayUsername}
              </span>
              {blog.is_guest_post && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  Guest
                </span>
              )}
            </div>
            <div className={`text-sm transition-colors ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {new Date(blog.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className={`text-xl font-bold mb-3 line-clamp-2 transition-colors ${
          isDark
            ? 'text-gray-100 hover:text-blue-400'
            : 'text-gray-900 hover:text-blue-600'
        }`}>
          {blog.title}
        </h2>

        {/* Content Preview */}
        <p className={`mb-4 line-clamp-3 text-sm leading-relaxed transition-colors ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
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
                    alt={blog.title}
                    className={`w-full h-auto max-h-96 object-contain rounded-lg shadow-sm border ${
                      isDark ? 'border-gray-700' : 'border-gray-200'
                    }`}
                    loading="lazy"
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
                      className={`w-full h-48 object-cover rounded-lg shadow-sm border ${
                        isDark ? 'border-gray-700' : 'border-gray-200'
                      }`}
                      loading="lazy"
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
                        className={`w-full h-full object-cover rounded-lg shadow-sm border ${
                          isDark ? 'border-gray-700' : 'border-gray-200'
                        }`}
                        loading="lazy"
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
          <div className={`flex items-center gap-5 mt-4 pt-4 border-t text-sm transition-colors ${
            isDark
              ? 'border-gray-700 text-gray-400'
              : 'border-gray-100 text-gray-500'
          }`}>
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
});

BlogCard.displayName = 'BlogCard';

export default BlogCard;
