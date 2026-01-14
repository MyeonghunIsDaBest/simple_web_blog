import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs } from '../../store/blogSlice';
import { RootState, AppDispatch } from '../../store';
import { Blog } from '../../types/';

interface BlogListProps {
  onViewBlog: (id: string) => void;
  onCreateBlog: () => void;
}

const BlogList: React.FC<BlogListProps> = ({ onViewBlog, onCreateBlog }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { blogs, loading, error } = useSelector((state: RootState) => state.blog);

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  const handleBlogClick = (id: string) => {
    onViewBlog(id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading blogs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">All Blogs</h1>
        <button
          onClick={onCreateBlog}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Blog
        </button>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-xl">No blogs found. Create your first blog!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog: Blog) => (
            <div
              key={blog.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleBlogClick(blog.id)}
            >
              <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                {blog.title}
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {blog.content}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{blog.author_email || 'Anonymous'}</span>
                <span>{new Date(blog.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogList;