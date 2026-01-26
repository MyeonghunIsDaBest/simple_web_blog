import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBlog } from '../../store/blogSlice';
import { AppDispatch, RootState } from '../../store';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 font-medium transition-all duration-200 hover:gap-3 group"
          >
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Posts
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Create New Post
              </h1>
              <p className="text-gray-600 mt-1">Share your thoughts with the community</p>
            </div>
          </div>
        </div>

        {/* Guest Notice */}
        {user?.isGuest && (
          <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-sm animate-fade-in">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-amber-900 font-semibold mb-2">
                  Posting as Guest
                </div>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Your post will be published anonymously. 
                  <button className="text-amber-700 font-medium hover:text-amber-800 underline ml-1">
                    Sign up
                  </button> 
                  {' '}to claim ownership of your posts and unlock more features.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-8 animate-fade-in">
          <div className="space-y-8">
            {/* Title Input */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Title
                </span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl font-medium transition-all duration-200 hover:border-gray-400 bg-white"
                placeholder="Give your post a compelling title..."
                required
              />
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">Make it catchy and descriptive</span>
                <span className={`text-xs font-medium ${title.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  {title.length > 0 && '✓'}
                </span>
              </div>
            </div>

            {/* Content Textarea */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Content
                </span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 hover:border-gray-400 bg-white leading-relaxed"
                placeholder="Share your story, ideas, or experiences... What's on your mind?"
                required
              />
              <div className="mt-3 flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {content.length} characters
                </span>
                <div className="flex items-center gap-3">
                  {content.length > 500 && (
                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Great length!
                    </span>
                  )}
                  {content.length > 1000 && (
                    <span className="text-sm text-amber-600 font-medium">
                      Detailed content
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 transition-colors">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Images
                  <span className="text-gray-400 font-normal text-xs">(Optional • Max 5 • Up to 5MB each)</span>
                </span>
              </label>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 border-dashed">
                <ImageUpload
                  images={images}
                  onImagesChange={setImages}
                  maxImages={5}
                  maxSizeMB={5}
                />
              </div>
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm animate-shake flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Publishing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Publish Post
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-4 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog;