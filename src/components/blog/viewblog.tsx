import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlog, deleteBlog, fetchComments, createComment, deleteComment } from '../../store/blogSlice';
import { AppDispatch, RootState } from '../../store';
import ImageUpload from '../common/imageupload';
import { Comment } from '../../types';

interface ViewBlogProps {
  blogId: string;
  onBack: () => void;
  onEdit: () => void;
}

const ViewBlog: React.FC<ViewBlogProps> = ({ blogId, onBack, onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentBlog, comments, loading, error } = useSelector((state: RootState) => state.blog);
  const { user, profile } = useSelector((state: RootState) => state.auth);
  const [commentContent, setCommentContent] = useState('');
  const [commentImages, setCommentImages] = useState<File[]>([]);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    dispatch(fetchBlog(blogId));
    dispatch(fetchComments(blogId));
  }, [dispatch, blogId]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await dispatch(deleteBlog(blogId)).unwrap();
        onBack();
      } catch (err) {
        console.error('Failed to delete post:', err);
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setSubmittingComment(true);
    try {
      await dispatch(
    createComment({
    blog_id: blogId,  // ✅ Correct property name
    content: commentContent,
    images: commentImages
     })
    ).unwrap();;
      setCommentContent('');
      setCommentImages([]);
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await dispatch(deleteComment(commentId)).unwrap();
      } catch (err) {
        console.error('Failed to delete comment:', err);
      }
    }
  };

  if (loading && !currentBlog) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading post...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-700">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!currentBlog) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-gray-600">Post not found</div>
      </div>
    );
  }

  const isAuthor = user?.id === currentBlog.author_id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <button
          onClick={onBack}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm"
        >
          ← Back to All Posts
        </button>

        <article className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentBlog.title}</h1>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {currentBlog.author_avatar ? (
                    <img
                      src={currentBlog.author_avatar}
                      alt={currentBlog.author_username || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {currentBlog.author_username || currentBlog.author_email || 'Anonymous'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(currentBlog.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                {currentBlog.is_guest_post && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">
                    Guest
                  </span>
                )}
              </div>
            </div>
            
            {isAuthor && (
              <div className="flex gap-2 ml-4">
                <button
                  onClick={onEdit}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="prose max-w-none mb-6">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {currentBlog.content}
            </div>
          </div>

          {currentBlog.image_urls && currentBlog.image_urls.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-6">
              {currentBlog.image_urls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Post ${index + 1}`}
                  className="w-full rounded-lg border border-gray-200"
                />
              ))}
            </div>
          )}
        </article>

        {/* Comments Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex gap-3 mb-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Your avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Write a comment..."
                  required
                />
              </div>
            </div>

            <div className="ml-13 mb-3">
              <ImageUpload
                images={commentImages}
                onImagesChange={setCommentImages}
                maxImages={3}
                maxSizeMB={3}
              />
            </div>

            <div className="ml-13">
              <button
                type="submit"
                disabled={submittingComment || !commentContent.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment: Comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                    {comment.author_avatar ? (
                      <img
                        src={comment.author_avatar}
                        alt={comment.author_username || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">
                          {comment.author_username || comment.author_email || 'Anonymous'}
                        </div>
                        {user?.id === comment.author_id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600 hover:text-red-700 text-xs"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                      {comment.image_urls && comment.image_urls.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {comment.image_urls.map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Comment ${index + 1}`}
                              className="w-full rounded border border-gray-200"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 ml-4">
                      {new Date(comment.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBlog;