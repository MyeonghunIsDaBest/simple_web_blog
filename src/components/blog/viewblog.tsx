import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogById, deleteBlog } from '../../store/blogSlice';
import { AppDispatch, RootState } from '../../store';

interface ViewBlogProps {
  blogId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
}

const ViewBlog: React.FC<ViewBlogProps> = ({ blogId, onBack, onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentBlog, loading, error } = useSelector((state: RootState) => state.blog);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchBlogById(blogId));
  }, [dispatch, blogId]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      const result = await dispatch(deleteBlog(blogId));
      if (deleteBlog.fulfilled.match(result)) {
        onBack();
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading blog...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">Error: {error}</div>;
  }

  if (!currentBlog) {
    return <div className="text-center mt-8">Blog not found</div>;
  }

  const isAuthor = user?.id === currentBlog.author_id;

  return (
    <div className="container mx-auto mt-8 px-4 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="text-blue-500 hover:underline"
        >
          Back to List
        </button>
        {isAuthor && (
          <div className="flex gap-4">
            <button
              onClick={() => onEdit(currentBlog.id)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      <article className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4">{currentBlog.title}</h1>
        <div className="text-sm text-gray-500 mb-6">
          <p>By: {currentBlog.author_email}</p>
          <p>Created: {new Date(currentBlog.created_at).toLocaleDateString()}</p>
          {currentBlog.updated_at !== currentBlog.created_at && (
            <p>Updated: {new Date(currentBlog.updated_at).toLocaleDateString()}</p>
          )}
        </div>
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap">{currentBlog.content}</p>
        </div>
      </article>
    </div>
  );
};

export default ViewBlog;