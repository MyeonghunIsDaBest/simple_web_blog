import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBlog } from '../../store/blogSlice';
import { AppDispatch, RootState } from '../../store';

interface CreateBlogProps {
  onBack: () => void;
}

const CreateBlog: React.FC<CreateBlogProps> = ({ onBack }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.blog);
  const { user } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createBlog({ title, content }));
    if (createBlog.fulfilled.match(result)) {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-4 text-sm"
          >
            ← Back
          </button>
          <h2 className="text-3xl font-bold text-gray-900">
            Create New Post
          </h2>
          <p className="text-gray-600 mt-1">Share your thoughts with the community</p>
        </div>

        {user?.isGuest && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="text-amber-600 font-medium text-sm">
                ℹ️ Posting as Guest
              </div>
            </div>
            <p className="text-sm text-amber-800 mt-1">
              Your post will be published anonymously. Sign up to claim ownership of your posts.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 rounded-lg">
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Give your post a title..."
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Write your post..."
              required
            />
            <div className="mt-2 text-xs text-gray-500">
              {content.length} characters
            </div>
          </div>
          
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Publishing...' : 'Publish Post'}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog;