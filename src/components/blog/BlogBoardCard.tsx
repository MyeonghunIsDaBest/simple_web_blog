import React from 'react';
import { Blog } from '../../types';

interface BlogBoardCardProps {
  blog: Blog;
  isDark: boolean;
  onClick: (id: string) => void;
  colorIndex: number;
}

const stickyColors = [
  { light: 'bg-yellow-200 border-yellow-300', dark: 'bg-yellow-700/30 border-yellow-600/50' },
  { light: 'bg-pink-200 border-pink-300', dark: 'bg-pink-700/30 border-pink-600/50' },
  { light: 'bg-blue-200 border-blue-300', dark: 'bg-blue-700/30 border-blue-600/50' },
  { light: 'bg-green-200 border-green-300', dark: 'bg-green-700/30 border-green-600/50' },
  { light: 'bg-purple-200 border-purple-300', dark: 'bg-purple-700/30 border-purple-600/50' },
  { light: 'bg-orange-200 border-orange-300', dark: 'bg-orange-700/30 border-orange-600/50' },
];

const BlogBoardCard: React.FC<BlogBoardCardProps> = React.memo(({ blog, isDark, onClick, colorIndex }) => {
  const avatarUrl = blog.author_avatar_url || blog.author_avatar;
  const displayUsername = blog.author_username_profile || blog.author_username || blog.author_email || 'Anonymous';
  const colorScheme = stickyColors[colorIndex % stickyColors.length];

  return (
    <div
      className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:-rotate-1 ${
        isDark ? colorScheme.dark : colorScheme.light
      } rounded-lg p-5 border-2 shadow-md relative overflow-hidden`}
      onClick={() => onClick(blog.id)}
      style={{
        minHeight: '200px',
        maxHeight: '300px',
      }}
    >
      {/* Tape effect at top */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-6 ${
        isDark ? 'bg-gray-700/50' : 'bg-gray-400/30'
      } rounded-sm shadow-sm`} />

      {/* Content */}
      <div className="flex flex-col h-full">
        {/* Author info */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-7 h-7 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow ${
            isDark ? 'bg-gray-700' : 'bg-white'
          } ring-1 ring-gray-300`}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayUsername}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-xs font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              {displayUsername}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
          {blog.is_guest_post && (
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
            }`}>
              Guest
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={`text-base font-bold mb-2 line-clamp-2 ${
          isDark ? 'text-gray-100' : 'text-gray-900'
        }`}>
          {blog.title}
        </h3>

        {/* Content Preview */}
        <p className={`text-xs line-clamp-4 mb-3 flex-1 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {blog.content}
        </p>

        {/* Image indicator if exists */}
        {blog.image_urls && blog.image_urls.length > 0 && (
          <div className="mb-2">
            <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
              isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-white/60 text-gray-700'
            }`}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{blog.image_urls.length} {blog.image_urls.length === 1 ? 'image' : 'images'}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {blog.like_count !== undefined && blog.like_count > 0 && (
            <span className="flex items-center gap-1">
              <span>👍</span>
              <span>{blog.like_count}</span>
            </span>
          )}
          {blog.comment_count !== undefined && blog.comment_count > 0 && (
            <span className="flex items-center gap-1">
              <span>💬</span>
              <span>{blog.comment_count}</span>
            </span>
          )}
          {blog.view_count > 0 && (
            <span className="flex items-center gap-1 ml-auto">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{blog.view_count}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

BlogBoardCard.displayName = 'BlogBoardCard';

export default BlogBoardCard;
