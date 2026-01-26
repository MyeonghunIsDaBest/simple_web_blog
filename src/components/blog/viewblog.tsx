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
import EditComment from './editcomment';
import { getErrorMessage } from '../../types';

interface ViewBlogProps {
  blogId: string;
  onBack: () => void;
  onEdit: () => void;
}

const ViewBlog: React.FC<ViewBlogProps> = ({ blogId, onBack, onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentBlog, comments, loading } = useSelector((state: RootState) => state.blog);
  const { user } = useSelector((state: RootState) => state.auth);
  const [commentContent, setCommentContent] = useState('');
  const [commentImages, setCommentImages] = useState<File[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likingPost, setLikingPost] = useState(false);
  const [editingComment, setEditingComment] = useState<any>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchBlog(blogId));
    dispatch(fetchComments(blogId));
    
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
    } catch (error: unknown) {
      console.error('Failed to toggle like:', error);
      alert(getErrorMessage(error) || 'Failed to update like');
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
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-6 text-sm font-medium hover:gap-3 transition-all"
        >
          <span>←</span> Back to posts
        </button>

        <article className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayUsername}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 text-lg">
                      {displayUsername}
                    </span>
                    {currentBlog.is_guest_post && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-medium">
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
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700 text-sm font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {currentBlog.title}
            </h1>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              {currentBlog.view_count > 0 && (
                <span className="flex items-center gap-2">
                  <span className="text-lg">👁️</span>
                  <span className="font-medium">{currentBlog.view_count} {currentBlog.view_count === 1 ? 'view' : 'views'}</span>
                </span>
              )}
              <span className="flex items-center gap-2">
                <span className="text-lg">💬</span>
                <span className="font-medium">{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="prose max-w-none mb-8">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">
                {currentBlog.content}
              </p>
            </div>

            {/* Post Images - Centered Layout */}
            {currentBlog.image_urls && currentBlog.image_urls.length > 0 && (
              <div className="mb-8">
                {currentBlog.image_urls.length === 1 ? (
                  // Single image - centered, larger
                  <div className="flex justify-center">
                    <img
                      src={currentBlog.image_urls[0]}
                      alt={currentBlog.title}
                      className="max-w-full h-auto max-h-[32rem] object-contain rounded-xl border border-gray-200 shadow-md"
                    />
                  </div>
                ) : currentBlog.image_urls.length === 2 ? (
                  // Two images - side by side centered
                  <div className="flex justify-center gap-4">
                    {currentBlog.image_urls.map((url, index) => (
                      <div key={index} className="w-[48%] max-w-md">
                        <img
                          src={url}
                          alt={`Post ${index + 1}`}
                          className="w-full h-auto max-h-80 object-cover rounded-xl border border-gray-200 shadow-md"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  // Three or more images - grid centered
                  <div className="flex justify-center">
                    <div className={`grid ${currentBlog.image_urls.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-3 max-w-3xl`}>
                      {currentBlog.image_urls.map((url, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={url}
                            alt={`Post ${index + 1}`}
                            className="w-full h-full object-cover rounded-xl border border-gray-200 shadow-md"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Like Button */}
            <div className="border-t border-b border-gray-200 py-4 mb-8">
              <button
                onClick={handleLikeToggle}
                disabled={likingPost || !user || user.isGuest}
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all ${
                  isLiked
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 shadow-sm'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={user?.isGuest ? 'Create an account to like posts' : ''}
              >
                <span className="text-xl">👍</span>
                <span>
                  {isLiked ? 'Liked' : 'Like'}
                  {localLikeCount > 0 && ` (${localLikeCount})`}
                </span>
              </button>
            </div>

            {/* Comments Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Comments ({comments.length})
              </h2>

              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="mb-4">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="mb-4">
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
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold shadow-sm hover:shadow-md"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-5">
                {comments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="text-4xl mb-3">💬</div>
                    <p className="font-medium">No comments yet</p>
                    <p className="text-sm mt-1">Be the first to share your thoughts!</p>
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
                      <div key={comment.id} className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                              {commentAvatarUrl ? (
                                <img
                                  src={commentAvatarUrl}
                                  alt={commentDisplayUsername}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">
                                  {commentDisplayUsername}
                                </span>
                                {comment.is_guest_comment && (
                                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
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
                             <div className="flex gap-2">
                               <button
                                 onClick={() => setEditingComment(comment)}
                                 className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                               >
                                 Edit
                               </button>
                               <button
                                 onClick={() => handleCommentDelete(comment.id)}
                                 className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                               >
                                 Delete
                               </button>
                             </div>
                           )}
                        </div>

                        <p className="text-gray-700 mb-3 whitespace-pre-wrap leading-relaxed">
                          {comment.content}
                        </p>

                        {/* Comment images - with click to expand */}
                        {comment.image_urls && comment.image_urls.length > 0 && (
                          <div className="grid grid-cols-2 gap-3 mt-4">
                             {comment.image_urls.map((url, index) => (
                               <img
                                 key={index}
                                 src={url}
                                 alt={`Comment attachment ${index + 1}`}
                                 onClick={() => setExpandedImage(url)}
                                 className="w-full h-48 object-cover rounded-xl border-2 border-gray-300 shadow-md hover:shadow-lg hover:border-blue-400 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
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

      {/* Edit Comment Modal */}
      {editingComment && (
        <EditComment
          comment={editingComment}
          isOpen={!!editingComment}
          onClose={() => setEditingComment(null)}
          onSuccess={() => {
            dispatch(fetchComments(blogId));
            setEditingComment(null);
          }}
        />
      )}

      {/* Image Lightbox Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
            <img
              src={expandedImage}
              alt="Expanded view"
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBlog;