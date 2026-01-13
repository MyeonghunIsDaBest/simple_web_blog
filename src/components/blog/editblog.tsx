import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogById, updateBlog } from '../../store/blogSlice';
import { AppDispatch, RootState } from '../../store';

interface EditBlogProps {
  blogId: string;
  onBack: () => void;
}

const EditBlog: React.FC<EditBlogProps> = ({ blogId, onBack }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { currentBlog, loading, error } = useSelector((state: RootState) => state.blog);

  useEffect(() => {
    dispatch(fetchBlogById(blogId));
  }, [dispatch, blogId]);

  useEffect(() => {
    if (currentBlog) {
      setTitle(currentBlog.title);
      setContent(currentBlog.content);
    }
  }, [currentBlog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(updateBlog({ id: blogId, title, content }));
    if (updateBlog.fulfilled.match(result)) {
      onBack();
    }
  };

  if (loading && !currentBlog) {
    return <div className="text-center mt-8">Loading blog...</div>;
  }

  return (
    <div className="container mx-auto mt-8 px-4 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Edit Blog</h2>
        <button
          onClick={onBack}
          className="text-blue-500 hover:underline"
        >
          Cancel
        </button>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Updating...' : 'Update Blog'}
        </button>
      </form>
    </div>
  );
};

export default EditBlog;