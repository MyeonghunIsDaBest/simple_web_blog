import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBlog,
  deleteBlog,
  fetchComments,
  createComment,
  deleteComment,
  likeBlog,
  unlikeBlog,
  checkIfLiked,
} from '../../store/blogSlice';
import { AppDispatch, RootState } from '../../store';
import ImageUpload from '../common/imageupload';

interface ViewBlogProps {
  blogId: string;
  onBack: () => void;
  onEdit: () => void;
}

const ViewBlog: React.FC<ViewBlogProps> = ({ blogId, onBack, onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentBlog, comments, loading } = useSelector((state: RootState) => state.blog);
  const { user, profile } = useSelector((state: RootState) => state.auth);
  const [commentContent, setCommentContent] = useState('');
  const [commentImages, setCommentImages] = useState<File[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likingPost, setLikingPost] = useState(false);

  useEffect(() => {
    dispatch(fetchBlog(blogId));
    dispatch(fetchComments(blogId));
    
    // Check if user has liked the blog (only for authenticated users)
    if (user && !user.isGuest) {
      dispatch(checkIfLiked(blogId)).then((result: any) => {
        if (result.payload) {
          setIsLiked(result.payload.liked);
        }
      });
    }
  }, [dispatch, blogId, user]);

  useEffect(() => {
    if (currentBlog) {
      setLocalLikeCount(currentBlog.like_count || 0);
    }
  }, [currentBlog]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await dispatch(deleteBlog(blogId));
      onBack();
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setSubmittingComment(true);
    try {
      await dispatch(
        createComment({
          blog_id: blogId,
          content: commentContent,
          images: commentImages,
        })
      ).unwrap();
      setCommentContent('');
      setCommentImages([]);
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await dispatch(deleteComment(commentId));
    }
  };

  const handleLikeToggle = async () => {
    if (!user) {
      alert('Please log in to like posts');
      return;
    }

    if (user.isGuest) {
      alert('Guest users cannot like posts. Please create an account!');
      return;
    }

    setLikingPost(true);
    try {
      if (isLiked) {
        await dispatch(unlikeBlog(blogId)).unwrap();
        setIsLiked(false);
        setLocalLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await dispatch(likeBlog(blogId)).unwrap();
        setIsLiked(true);
        setLocalLikeCount(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('Failed to toggle like:', error);
      alert(error || 'Failed to update like');
    } finally {
      setLikingPost(false);
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

  if (!currentBlog) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <div className="text-red-700">Post not found</div>
          <button
            onClick={onBack}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const isAuthor = user && (
    (user.isGuest && currentBlog.is_guest_post && currentBlog.author_email === user.email) ||
    (!user.isGuest && currentBlog.author_id === user.id)
  );

  const avatarUrl = currentBlog.author_avatar_url || currentBlog.author_avatar;
  const displayUsername = currentBlog.author_username_profile || currentBlog.author_username || currentBlog.author_email || 'Anonymous';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-6 text-sm"
        >
          ← Back to posts
        </button>

        <article className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayUsername}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-7 h-7 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {displayUsername}
                    </span>
                    {currentBlog.is_guest_post && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-medium">
                        Guest
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(currentBlog.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              {isAuthor && (
                <div className="flex gap-2">
                  <button
                    onClick={onEdit}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 hover:bg-blue-50 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {currentBlog.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              {currentBlog.view_count > 0 && (
                <span className="flex items-center gap-1">
                  👁️ {currentBlog.view_count} {currentBlog.view_count === 1 ? 'view' : 'views'}
                </span>
              )}
              <span className="flex items-center gap-1">
                💬 {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {currentBlog.content}
              </p>
            </div>

            {/* Images */}
            {currentBlog.image_urls && currentBlog.image_urls.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {currentBlog.image_urls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Post image ${index + 1}`}
                    className="w-full rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            )}

            {/* Like Button */}
            <div className="border-t border-b border-gray-200 py-3 mb-6">
              <button
                onClick={handleLikeToggle}
                disabled={likingPost || !user || user.isGuest}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  isLiked
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={user?.isGuest ? 'Create an account to like posts' : ''}
              >
                <span className="text-lg">👍</span>
                <span>
                  {isLiked ? 'Liked' : 'Like'}
                  {localLikeCount > 0 && ` (${localLikeCount})`}
                </span>
              </button>
            </div>

            {/* Comments Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Comments ({comments.length})
              </h2>

              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="mb-3">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Write a comment..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="mb-3">
                  <ImageUpload
                    images={commentImages}
                    onImagesChange={setCommentImages}
                    maxImages={3}
                    maxSizeMB={3}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingComment || !commentContent.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No comments yet. Be the first to comment!
                  </div>
                ) : (
                  comments.map((comment) => {
                    const commentAvatarUrl = comment.author_avatar_url || comment.author_avatar;
                    const commentDisplayUsername = comment.author_username_profile || comment.author_username || comment.author_email || 'Anonymous';
                    const isCommentAuthor = user && (
                      (user.isGuest && comment.is_guest_comment && comment.author_email === user.email) ||
                      (!user.isGuest && comment.author_id === user.id)
                    );

                    return (
                      <div key={comment.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                              {commentAvatarUrl ? (
                                <img
                                  src={commentAvatarUrl}
                                  alt={commentDisplayUsername}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {commentDisplayUsername}
                                </span>
                                {comment.is_guest_comment && (
                                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded font-medium">
                                    Guest
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
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

                          {isCommentAuthor && (
                            <button
                              onClick={() => handleCommentDelete(comment.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>

                        <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                          {comment.content}
                        </p>

                        {comment.image_urls && comment.image_urls.length > 0 && (
                          <div className="grid grid-cols-2 gap-2">
                            {comment.image_urls.map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt={`Comment image ${index + 1}`}
                                className="w-full h-32 object-cover rounded border border-gray-300"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ViewBlog;