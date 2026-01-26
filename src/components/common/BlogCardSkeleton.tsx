import React from 'react';

interface BlogCardSkeletonProps {
  isDark?: boolean;
}

const BlogCardSkeleton: React.FC<BlogCardSkeletonProps> = ({ isDark = false }) => {
  return (
    <div
      className={`rounded-xl overflow-hidden shadow-sm border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="p-6 animate-pulse">
        {/* Author Header Skeleton */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-11 h-11 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className="flex-1">
            <div className={`h-4 rounded w-32 mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div className={`h-3 rounded w-24 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          </div>
        </div>

        {/* Title Skeleton */}
        <div className={`h-6 rounded w-3/4 mb-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />

        {/* Content Skeleton */}
        <div className="space-y-2 mb-4">
          <div className={`h-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-4 rounded w-5/6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>

        {/* Image Skeleton */}
        <div className="mt-4 mb-3 flex justify-center">
          <div className={`max-w-2xl w-full h-64 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>

        {/* Stats Skeleton */}
        <div className={`flex items-center gap-5 mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className={`h-4 rounded w-12 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-4 rounded w-12 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-4 rounded w-12 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>
      </div>
    </div>
  );
};

export default BlogCardSkeleton;
