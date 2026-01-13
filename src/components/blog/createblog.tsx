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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(createBlog({ title, content }));
    if (createBlog.fulfilled.match(result)) {
      onBack();
    }
  };

  return (
    <div className="container mx-auto mt-8 px-4 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Create New Blog</h2>
        <button
          onClick={onBack}
          className="text-blue-500 hover:underline"
        >
          Back to List
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
          {loading ? 'Creating...' : 'Create Blog'}
        </button>
      </form>
    </div>
  );
};

export default CreateBlog;