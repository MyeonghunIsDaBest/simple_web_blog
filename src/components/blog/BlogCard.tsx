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
      className={`group rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 shadow-sm hover:shadow-2xl border ${
        isDark
          ? 'bg-gray-800/50 border-gray-700 hover:border-blue-600 hover:bg-gray-800/70 hover:-translate-y-2'
          : 'bg-white/80 border-gray-200 hover:border-blue-400 hover:bg-white/95 hover:-translate-y-2'
      } backdrop-blur-sm`}
      onClick={() => onClick(blog.id)}
    >
      <div className="relative">
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-t ${
          isDark 
            ? 'from-blue-600/10 via-transparent to-transparent' 
            : 'from-blue-400/10 via-transparent to-transparent'
        } opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
        
        <div className="p-6 relative z-10">
          {/* Author Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ${
              isDark ? 'ring-gray-700 bg-gradient-to-br from-gray-600 to-gray-700' : 'ring-white bg-gradient-to-br from-gray-500 to-gray-600'
            } group-hover:scale-110 transition-transform duration-300`}>
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
              <div className="flex items-center gap-3">
                <span className={`font-semibold text-base transition-colors ${
                  isDark ? 'text-gray-100 group-hover:text-blue-400' : 'text-gray-900 group-hover:text-blue-600'
                }`}>
                  {displayUsername}
                </span>
                {blog.is_guest_post && (
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                    isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
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
          <h2 className={`text-xl font-bold mb-3 line-clamp-2 transition-all duration-300 ${
            isDark
              ? 'text-gray-100 group-hover:text-blue-400'
              : 'text-gray-900 group-hover:text-blue-600'
          }`}>
            {blog.title}
          </h2>

          {/* Content Preview */}
          <p className={`mb-4 ${blog.image_urls && blog.image_urls.length > 0 ? 'line-clamp-3' : 'line-clamp-5'} text-sm leading-relaxed transition-colors ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {blog.content}
          </p>

          {/* No images indicator - for posts without images */}
          {(!blog.image_urls || blog.image_urls.length === 0) && (
            <div className={`mb-4 p-4 rounded-lg border-2 border-dashed flex items-center justify-center ${
              isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="text-center">
                <svg className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Text-only post
                </p>
              </div>
            </div>
          )}

          {/* Images - Enhanced Responsive Layout */}
          {blog.image_urls && blog.image_urls.length > 0 && (
            <div className="mt-5 mb-4">
              {blog.image_urls.length === 1 ? (
                // Single image - responsive centered with better aspect ratio
                <div className="flex justify-center">
                  <div className="w-full max-w-3xl">
                    <div className="relative w-full overflow-hidden rounded-xl shadow-md group-hover:shadow-xl transition-shadow duration-300" style={{ paddingBottom: '56.25%' }}>
                      <img
                        src={blog.image_urls[0]}
                        alt={blog.title}
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                          isDark ? 'border-gray-700' : 'border-gray-200'
                        }`}
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              ) : blog.image_urls.length === 2 ? (
                // Two images - responsive side by side
                <div className="grid grid-cols-2 gap-3">
                  {blog.image_urls.map((url, index) => (
                    <div key={index} className="relative overflow-hidden rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300" style={{ paddingBottom: '75%' }}>
                      <img
                        src={url}
                        alt={`Post ${index + 1}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 border ${
                          isDark ? 'border-gray-700' : 'border-gray-200'
                        }`}
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                // Three or more images - responsive grid
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                  {blog.image_urls.slice(0, 4).map((url, index) => (
                    <div
                      key={index}
                      className={`relative overflow-hidden rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300 ${
                        index === 0 && blog.image_urls!.length >= 3 ? 'col-span-2 md:col-span-2' : ''
                      }`}
                      style={{ paddingBottom: index === 0 && blog.image_urls!.length >= 3 ? '50%' : '100%' }}
                    >
                      <img
                        src={url}
                        alt={`Post ${index + 1}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 border ${
                          isDark ? 'border-gray-700' : 'border-gray-200'
                        }`}
                        loading="lazy"
                      />
                      {index === 3 && blog.image_urls!.length > 4 && (
                        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center backdrop-blur-sm transition-all duration-300 group-hover:bg-opacity-60">
                          <span className="text-white font-bold text-3xl">
                            +{blog.image_urls!.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          {(blog.like_count !== undefined || blog.comment_count !== undefined || blog.view_count > 0) && (
            <div className={`flex items-center justify-between mt-4 pt-4 border-t text-sm transition-colors ${
              isDark
                ? 'border-gray-700 text-gray-400'
                : 'border-gray-100 text-gray-500'
            }`}>
              <div className="flex items-center gap-5">
                {blog.like_count !== undefined && blog.like_count > 0 && (
                  <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer">
                    <span className="text-base">👍</span>
                    <span className="font-medium">{blog.like_count}</span>
                  </span>
                )}
                {blog.comment_count !== undefined && blog.comment_count > 0 && (
                  <span className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer">
                    <span className="text-base">💬</span>
                    <span className="font-medium">{blog.comment_count}</span>
                  </span>
                )}
              </div>
              {blog.view_count > 0 && (
                <span className="flex items-center gap-1.5 text-xs opacity-75">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="font-medium">{blog.view_count}</span>
                </span>
              )}
            </div>
          )}

          {/* Read more indicator */}
          <div className={`mt-4 flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
            isDark 
              ? 'text-blue-400 group-hover:text-blue-300' 
              : 'text-blue-600 group-hover:text-blue-700'
          }`}>
            <span>Read more</span>
            <svg className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
});

BlogCard.displayName = 'BlogCard';

export default BlogCard;