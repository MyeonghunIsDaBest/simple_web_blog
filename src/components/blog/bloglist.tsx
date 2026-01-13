import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs } from '../../store/blogSlice';
import { AppDispatch, RootState } from '../../store';

interface BlogListProps {
  onViewBlog: (id: string) => void;
}

const BlogList: React.FC<BlogListProps> = ({ onViewBlog }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { blogs, loading, error } = useSelector((state: RootState) => state.blog);

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  if (loading) {
    return <div className="text-center mt-8">Loading blogs...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto mt-8 px-4">
      <h2 className="text-3xl font-bold mb-6">All Blogs</h2>
      {blogs.length === 0 ? (
        <p className="text-gray-600">No blogs yet. Create your first blog!</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onViewBlog(blog.id)}
            >
              <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{blog.content}</p>
              <div className="text-sm text-gray-500">
                <p>By: {blog.author_email}</p>
                <p>Created: {new Date(blog.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogList;