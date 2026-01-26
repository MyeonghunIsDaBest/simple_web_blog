import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlog, updateBlog } from '../../store/blogSlice';
import { AppDispatch, RootState } from '../../store';
import ImageManager from '../common/imagemanager';
import { getErrorMessage } from '../../types';

interface EditBlogProps {
  blogId: string;
  onBack: () => void;
}

const EditBlog: React.FC<EditBlogProps> = ({ blogId, onBack }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentBlog, loading } = useSelector((state: RootState) => state.blog);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchBlog(blogId));
  }, [dispatch, blogId]);

  useEffect(() => {
    if (currentBlog) {
      setTitle(currentBlog.title);
      setContent(currentBlog.content);
      setExistingImages(currentBlog.image_urls || []);
    }
  }, [currentBlog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      await dispatch(updateBlog({
        id: blogId,
        title,
        content,
        image_urls: existingImages,
        images: newImages
      })).unwrap();
      onBack();
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Failed to update post');
    }
  };

  if (loading && !currentBlog) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900">
            Edit Post
          </h1>
          <p className="text-gray-600 mt-2">Make changes to your post</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm">
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="Post title"
            />
          </div>

           <div className="mb-8">
             <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
               Content
             </label>
             <textarea
               id="content"
               value={content}
               onChange={(e) => setContent(e.target.value)}
               rows={14}
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
               placeholder="Write your post content..."
             />
             <div className="mt-2 text-xs text-gray-500">
               {content.length} characters
             </div>
           </div>

           <div className="mb-8">
             <label className="block text-sm font-semibold text-gray-700 mb-2">
               Images <span className="text-gray-400 font-normal">(Optional)</span>
             </label>
             <ImageManager
               existingImages={existingImages}
               newImages={newImages}
               onExistingImagesChange={setExistingImages}
               onNewImagesChange={setNewImages}
               maxImages={5}
               maxSizeMB={5}
             />
           </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
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

export default EditBlog;