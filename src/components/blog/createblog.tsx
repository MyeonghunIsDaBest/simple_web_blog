import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBlog } from '../../store/blogSlice';
import { AppDispatch, RootState } from '../../store/';
import ImageUpload from '../common/imageupload';

interface CreateBlogProps {
  onBack: () => void;
}

const CreateBlog: React.FC<CreateBlogProps> = ({ onBack }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.blog);
  const { user } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createBlog({ title, content, images }));
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
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-6 text-sm font-medium hover:gap-3 transition-all"
          >
            <span>←</span> Back
          </button>
          <h2 className="text-4xl font-bold text-gray-900">
            Create New Post
          </h2>
          <p className="text-gray-600 mt-2">Share your thoughts with the community</p>
        </div>

        {user?.isGuest && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
            <div className="flex gap-3 items-start">
              <span className="text-2xl">📝</span>
              <div>
                <div className="text-amber-900 font-semibold mb-1">
                  Posting as Guest
                </div>
                <p className="text-sm text-amber-800">
                  Your post will be published anonymously. Sign up to claim ownership of your posts and unlock more features.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="Give your post a compelling title..."
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={14}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Share your story, ideas, or experiences..."
              required
            />
            <div className="mt-2 text-xs text-gray-500 flex justify-between items-center">
              <span>{content.length} characters</span>
              {content.length > 500 && (
                <span className="text-green-600 font-medium">✓ Great length!</span>
              )}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Images <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={5}
              maxSizeMB={5}
            />
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Publishing...
                </span>
              ) : (
                'Publish Post'
              )}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
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