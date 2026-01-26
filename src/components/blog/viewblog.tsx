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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 mb-8 text-gray-600 hover:text-gray-900 font-medium transition-all duration-200 hover:gap-3 group"
        >
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to posts
        </button>

        <article className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-xl animate-fade-in">
          {/* Header */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-lg ring-4 ring-white ${
                  currentBlog.is_guest_post
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                    : 'bg-gradient-to-br from-gray-500 to-gray-600'
                }`}>
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
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-gray-900 text-xl">
                      {displayUsername}
                    </span>
                    {currentBlog.is_guest_post && (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs px-3 py-1.5 rounded-full font-medium border border-amber-200">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                        </svg>
                        Guest Author
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
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
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium px-4 py-2 hover:bg-blue-50 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium px-4 py-2 hover:bg-red-50 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 leading-tight">
              {currentBlog.title}
            </h1>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              {currentBlog.view_count > 0 && (
                <span className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="font-medium">{currentBlog.view_count.toLocaleString()} {currentBlog.view_count === 1 ? 'view' : 'views'}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-medium">{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
              </span>
            </div>
          </div>

{/* Content */}
          <div className="p-8">
            <div className="prose prose-lg prose-gray max-w-none mb-8">
              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg md:text-xl font-serif">
                {currentBlog.content}
              </div>
            </div>

            {/* Post Images - Enhanced Gallery Layout */}
            {currentBlog.image_urls && currentBlog.image_urls.length > 0 && (
              <div className="mb-10">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Gallery ({currentBlog.image_urls.length})
                </h3>
                {currentBlog.image_urls.length === 1 ? (
                  // Single image - hero style
                  <div className="flex justify-center">
                    <div className="relative group cursor-pointer" onClick={() => setExpandedImage(currentBlog.image_urls![0])}>
                      <img
                        src={currentBlog.image_urls[0]}
                        alt={currentBlog.title}
                        className="max-w-full h-auto max-h-[40rem] object-contain rounded-2xl border border-gray-200 shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                          <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : currentBlog.image_urls.length === 2 ? (
                  // Two images - side by side
                  <div className="flex justify-center gap-6">
                    {currentBlog.image_urls.map((url, index) => (
                      <div key={index} className="w-5/12 max-w-md">
                        <div className="relative group cursor-pointer" onClick={() => setExpandedImage(url)}>
                          <img
                            src={url}
                            alt={`Post ${index + 1}`}
                            className="w-full h-auto max-h-96 object-cover rounded-2xl border border-gray-200 shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                              <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Three or more images - responsive grid
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {currentBlog.image_urls.map((url, index) => (
                      <div key={index} className="relative group cursor-pointer" onClick={() => setExpandedImage(url)}>
                        <img
                          src={url}
                          alt={`Post ${index + 1}`}
                          className="w-full h-64 md:h-72 object-cover rounded-2xl border border-gray-200 shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                            <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Engagement Section */}
            <div className="border-t border-b border-gray-100 py-6 mb-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={handleLikeToggle}
                  disabled={likingPost || !user || user.isGuest}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    isLiked
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-xl'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg'
                  } disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]`}
                  title={user?.isGuest ? 'Create an account to like posts' : ''}
                >
                  {likingPost ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  )}
                  <span>
                    {isLiked ? 'Liked' : 'Like'}
                    {localLikeCount > 0 && ` (${localLikeCount.toLocaleString()})`}
                  </span>
                </button>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Share
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Save
                  </span>
                </div>
              </div>
            </div>

{/* Comments Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Discussion ({comments.length})
                </h2>
                {comments.length > 0 && (
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Sort by newest
                  </button>
                )}
              </div>

              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-10 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="mb-4">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Join the discussion... What are your thoughts?"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white transition-all duration-200"
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

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {user?.isGuest ? 'Guest users can comment freely' : 'Be respectful and constructive'}
                  </div>
                  <button
                    type="submit"
                    disabled={submittingComment || !commentContent.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                  >
                    {submittingComment ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Posting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Post Comment
                      </>
                    )}
                  </button>
                </div>
              </form>

{/* Comments List */}
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No comments yet</h3>
                    <p className="text-gray-500">Be the first to share your thoughts on this post!</p>
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
                      <div key={comment.id} className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-white ${
                              comment.is_guest_comment 
                                ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
                                : 'bg-gradient-to-br from-blue-500 to-purple-600'
                            }`}>
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
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-semibold text-gray-900 text-base">
                                  {commentDisplayUsername}
                                </span>
                                {comment.is_guest_comment && (
                                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium border border-amber-200">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                    </svg>
                                    Guest
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
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
                                 className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-all duration-200"
                               >
                                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                 </svg>
                                 Edit
                               </button>
                               <button
                                 onClick={() => handleCommentDelete(comment.id)}
                                 className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1.5 hover:bg-red-50 rounded-lg transition-all duration-200"
                               >
                                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                 </svg>
                                 Delete
                               </button>
                             </div>
                           )}
                        </div>

                        <div className="text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed text-base">
                          {comment.content}
                        </div>

                        {/* Comment images - enhanced gallery */}
                        {comment.image_urls && comment.image_urls.length > 0 && (
                          <div className="mt-4">
                            <div className="grid grid-cols-2 gap-3">
                               {comment.image_urls.map((url, index) => (
                                 <div key={index} className="relative group cursor-pointer" onClick={() => setExpandedImage(url)}>
                                   <img
                                     src={url}
                                     alt={`Comment attachment ${index + 1}`}
                                     className="w-full h-48 object-cover rounded-xl border-2 border-gray-200 shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:border-blue-400 group-hover:scale-[1.02]"
                                   />
                                   <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                                     <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                                       <svg className="w-4 h-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                       </svg>
                                     </div>
                                   </div>
                                 </div>
                               ))}
                            </div>
                          </div>
                        )}

                        {/* Comment actions */}
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            Reply
                          </button>
                          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            Like
                          </button>
                        </div>
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
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute -top-14 right-0 text-white hover:text-gray-300 text-xl font-bold bg-white/10 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 hover:bg-white/20 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-1">
              <img
                src={expandedImage}
                alt="Expanded view"
                className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBlog;