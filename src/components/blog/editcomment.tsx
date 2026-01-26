import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateComment } from '../../store/blogSlice';
import { AppDispatch } from '../../store';
import ImageManager from '../common/imagemanager';
import { Comment, getErrorMessage } from '../../types';

interface EditCommentProps {
  comment: Comment;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditComment: React.FC<EditCommentProps> = ({ comment, isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [content, setContent] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && comment) {
      setContent(comment.content);
      setExistingImages(comment.image_urls || []);
      setNewImages([]);
      setError('');
    }
  }, [isOpen, comment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Comment content is required');
      return;
    }

    setLoading(true);
    try {
      await dispatch(updateComment({
        id: comment.id,
        content,
        image_urls: existingImages,
        images: newImages
      })).unwrap();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Failed to update comment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Edit Comment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Comment Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Update your comment..."
              required
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
              maxImages={3}
              maxSizeMB={3}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditComment;