import React from 'react';

interface CommentSkeletonProps {
  isDark?: boolean;
  count?: number;
}

const CommentSkeleton: React.FC<CommentSkeletonProps> = ({ isDark = false, count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="animate-pulse">
            {/* Author Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <div className="flex-1">
                <div className={`h-3 rounded w-24 mb-1.5 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                <div className={`h-2 rounded w-16 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
              </div>
            </div>

            {/* Comment Content */}
            <div className="space-y-2 mb-3">
              <div className={`h-3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <div className={`h-3 rounded w-4/5 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <div className={`h-6 rounded w-12 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <div className={`h-6 rounded w-12 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default CommentSkeleton;
