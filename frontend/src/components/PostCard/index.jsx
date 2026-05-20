// import React, { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   createComment,
//   deleteComment,
//   deletePost,
//   getAllPosts,
//   getCommentsByPost,
//   togglePostLike,
// } from "@/config/redux/action/postAction";
// import { getMediaUrl, getUserAvatar } from "@/utils/media";
// import styles from "./styles.module.css";

// export default function PostCard({ post, currentUser, onDeleted }) {
//   const dispatch = useDispatch();
//   const comments = useSelector(
//     (state) => state.postReducer.commentsByPost[post._id] || []
//   );
//   const commentsLoading = useSelector(
//     (state) => state.postReducer.commentsLoadingByPost[post._id]
//   );
//   const [commentsOpen, setCommentsOpen] = useState(false);
//   const [commentBody, setCommentBody] = useState("");
//   const [copied, setCopied] = useState(false);

//   const isOwner = post.userId?._id === currentUser?._id;
//   const postMedia = post.mediaUrl || post.media;
//   const mediaUrl = getMediaUrl(postMedia);
//   const isImage =
//     post.fileType?.startsWith("image/") ||
//     /\.(png|jpe?g|gif|webp|avif)$/i.test(postMedia || "");

//   const handleCommentsToggle = async () => {
//     const nextOpen = !commentsOpen;
//     setCommentsOpen(nextOpen);
//     if (nextOpen && comments.length === 0) {
//       await dispatch(getCommentsByPost(post._id));
//     }
//   };

//   const handleCommentSubmit = async () => {
//     const trimmed = commentBody.trim();
//     if (!trimmed) return;
//     await dispatch(createComment({ postId: post._id, body: trimmed }));
//     setCommentBody("");
//   };

//   const handleShare = async () => {
//     const shareUrl = `${window.location.origin}/dashboard?post=${post._id}`;
//     const shareData = {
//       title: `${post.userId?.name || "Fynk"} on Fynk`,
//       text: post.body || "Check this post on Fynk",
//       url: shareUrl,
//     };

//     try {
//       if (navigator.share) {
//         await navigator.share(shareData);
//       } else {
//         await navigator.clipboard.writeText(shareUrl);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 1200);
//       }
//     } catch {
//       await navigator.clipboard.writeText(shareUrl);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 1200);
//     }
//   };

//   const handleDeletePost = async () => {
//     await dispatch(deletePost({ post_id: post._id }));
//     if (onDeleted) {
//       onDeleted(post._id);
//     } else {
//       await dispatch(getAllPosts());
//     }
//   };

//   return (
//     <div className={styles.singleCard}>
//       <div className={styles.singleCard_profileContainer}>
//         <img src={getUserAvatar(post.userId)} alt={post.userId?.name || "User"} />
//         <div className={styles.postContent}>
//           <div className={styles.postHeader}>
//             <div>
//               <p className={styles.name}>{post.userId?.name}</p>
//               <p className={styles.username}>@{post.userId?.username}</p>
//             </div>

//             {isOwner && (
//               <button
//                 type="button"
//                 onClick={handleDeletePost}
//                 className={styles.iconButton}
//                 title="Delete post"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
//                 </svg>
//               </button>
//             )}
//           </div>

//           {post.body && <p className={styles.body}>{post.body}</p>}

//           {mediaUrl && (
//             <div className={styles.singleCard_image}>
//               {isImage ? (
//                 <img src={mediaUrl} alt="" />
//               ) : (
//                 <a className={styles.fileLink} href={mediaUrl} target="_blank" rel="noreferrer">
//                   Open attachment
//                 </a>
//               )}
//             </div>
//           )}

//           <div className={styles.actions}>
//             <button
//               type="button"
//               onClick={() => dispatch(togglePostLike(post._id))}
//               className={`${styles.actionButton} ${post.likedByMe ? styles.active : ""}`}
//             >
//               <span>{post.likedByMe ? "Liked" : "Like"}</span>
//               <strong>{post.likeCount || post.likes || 0}</strong>
//             </button>

//             <button type="button" onClick={handleCommentsToggle} className={styles.actionButton}>
//               <span>Comment</span>
//               <strong>{post.commentCount || 0}</strong>
//             </button>

//             <button type="button" onClick={handleShare} className={styles.actionButton}>
//               <span>{copied ? "Copied" : "Share"}</span>
//             </button>
//           </div>

//           {commentsOpen && (
//             <div className={styles.commentsPanel}>
//               <div className={styles.commentInputRow}>
//                 <input
//                   value={commentBody}
//                   onChange={(e) => setCommentBody(e.target.value)}
//                   placeholder="Write a comment"
//                   className={styles.commentInput}
//                 />
//                 <button type="button" onClick={handleCommentSubmit} className={styles.commentButton}>
//                   Post
//                 </button>
//               </div>

//               {commentsLoading && <p className={styles.subtleText}>Loading comments...</p>}

//               {!commentsLoading && comments.length === 0 && (
//                 <p className={styles.subtleText}>No comments yet</p>
//               )}

//               {comments.map((comment) => {
//                 const canDelete =
//                   comment.userId?._id === currentUser?._id || post.userId?._id === currentUser?._id;

//                 return (
//                   <div key={comment._id} className={styles.commentItem}>
//                     <img src={getUserAvatar(comment.userId)} alt={comment.userId?.name || "User"} />
//                     <div className={styles.commentBody}>
//                       <div className={styles.commentHeader}>
//                         <p>{comment.userId?.name}</p>
//                         {canDelete && (
//                           <button
//                             type="button"
//                             onClick={() =>
//                               dispatch(deleteComment({ postId: post._id, commentId: comment._id }))
//                             }
//                           >
//                             Delete
//                           </button>
//                         )}
//                       </div>
//                       <span>{comment.body}</span>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createComment,
  deleteComment,
  deletePost,
  getAllPosts,
  getCommentsByPost,
  togglePostLike,
} from "@/config/redux/action/postAction";
import { getMediaUrl, getUserAvatar } from "@/utils/media";
import styles from "./styles.module.css";

const REACTIONS = [
  { key: "like",    emoji: "👍", label: "Like",    color: "#4f6ef7" },
  { key: "love",    emoji: "❤️", label: "Love",    color: "#e0245e" },
  { key: "haha",    emoji: "😂", label: "Haha",    color: "#f7b928" },
  { key: "wow",     emoji: "😮", label: "Wow",     color: "#f7b928" },
  { key: "sad",     emoji: "😢", label: "Sad",     color: "#f7b928" },
];

export default function PostCard({ post, currentUser, onDeleted }) {
  const dispatch = useDispatch();
  const comments = useSelector(
    (state) => state.postReducer.commentsByPost[post._id] || []
  );
  const commentsLoading = useSelector(
    (state) => state.postReducer.commentsLoadingByPost[post._id]
  );
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [copied, setCopied] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [myReaction, setMyReaction] = useState(post.likedByMe ? "like" : null);
  const reactionTimer = useRef(null);
  const reactBtnRef = useRef(null);

  const isOwner = post.userId?._id === currentUser?._id;
  const postMedia = post.mediaUrl || post.media;
  const mediaUrl = getMediaUrl(postMedia);
  const isImage =
    post.fileType?.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|avif)$/i.test(postMedia || "");

  const likeCount = post.likeCount || post.likes || 0;
  const currentReaction = REACTIONS.find((r) => r.key === myReaction);

  // Show reaction picker on hover
  const handleLikeMouseEnter = () => {
    reactionTimer.current = setTimeout(() => setShowReactions(true), 500);
  };
  const handleLikeMouseLeave = () => {
    clearTimeout(reactionTimer.current);
    setTimeout(() => setShowReactions(false), 300);
  };

  const handleReactionPick = (reactionKey) => {
    setMyReaction((prev) => (prev === reactionKey ? null : reactionKey));
    setShowReactions(false);
    dispatch(togglePostLike(post._id));
  };

  const handleLikeClick = () => {
    if (myReaction) {
      setMyReaction(null);
      dispatch(togglePostLike(post._id));
    } else {
      setMyReaction("like");
      dispatch(togglePostLike(post._id));
    }
  };

  const handleCommentsToggle = async () => {
    const nextOpen = !commentsOpen;
    setCommentsOpen(nextOpen);
    if (nextOpen && comments.length === 0) {
      await dispatch(getCommentsByPost(post._id));
    }
  };

  const handleCommentSubmit = async () => {
    const trimmed = commentBody.trim();
    if (!trimmed) return;
    await dispatch(createComment({ postId: post._id, body: trimmed }));
    setCommentBody("");
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/dashboard?post=${post._id}`;
    const shareData = {
      title: `${post.userId?.name || "Fynk"} on Fynk`,
      text: post.body || "Check this post on Fynk",
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleDeletePost = async () => {
    await dispatch(deletePost({ post_id: post._id }));
    if (onDeleted) {
      onDeleted(post._id);
    } else {
      await dispatch(getAllPosts());
    }
  };

  return (
    <div className={styles.singleCard}>
      <div className={styles.singleCard_profileContainer}>
        <img
          src={getUserAvatar(post.userId)}
          alt={post.userId?.name || "User"}
          className={styles.avatar}
        />
        <div className={styles.postContent}>
          {/* Header */}
          <div className={styles.postHeader}>
            <div className={styles.userInfo}>
              <p className={styles.name}>{post.userId?.name}</p>
              <p className={styles.username}>@{post.userId?.username}</p>
            </div>
            {isOwner && (
              <button
                type="button"
                onClick={handleDeletePost}
                className={styles.iconButton}
                title="Delete post"
              >
                {/* Trash icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            )}
          </div>

          {/* Body */}
          {post.body && <p className={styles.body}>{post.body}</p>}

          {/* Media */}
          {mediaUrl && (
            <div className={styles.singleCard_image}>
              {isImage ? (
                <img src={mediaUrl} alt="" />
              ) : (
                <a className={styles.fileLink} href={mediaUrl} target="_blank" rel="noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                  </svg>
                  Open attachment
                </a>
              )}
            </div>
          )}

          {/* Stats row */}
          {(likeCount > 0 || post.commentCount > 0) && (
            <div className={styles.statsRow}>
              {likeCount > 0 && (
                <span className={styles.statItem}>
                  <span className={styles.reactionEmojis}>
                    {REACTIONS.slice(0, 3).map(r => (
                      <span key={r.key}>{r.emoji}</span>
                    ))}
                  </span>
                  {likeCount}
                </span>
              )}
              {post.commentCount > 0 && (
                <span className={styles.statItem} style={{ marginLeft: "auto" }}>
                  {post.commentCount} comment{post.commentCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}

          {/* Divider */}
          <div className={styles.actionsDivider} />

          {/* Action Buttons */}
          <div className={styles.actions}>
            {/* Like with reaction picker */}
            <div
              className={styles.reactionWrapper}
              onMouseEnter={handleLikeMouseEnter}
              onMouseLeave={handleLikeMouseLeave}
            >
              {showReactions && (
                <div className={styles.reactionPicker}>
                  {REACTIONS.map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      className={styles.reactionOption}
                      onClick={() => handleReactionPick(r.key)}
                      title={r.label}
                      style={{ "--reaction-color": r.color }}
                    >
                      <span className={styles.reactionEmoji}>{r.emoji}</span>
                      <span className={styles.reactionLabel}>{r.label}</span>
                    </button>
                  ))}
                </div>
              )}
              <button
                ref={reactBtnRef}
                type="button"
                onClick={handleLikeClick}
                className={`${styles.actionButton} ${myReaction ? styles.reacted : ""}`}
                style={myReaction ? { "--active-color": currentReaction?.color } : {}}
              >
                {/* Thumbs up icon (or reaction emoji) */}
                {myReaction ? (
                  <span className={styles.reactionActive}>{currentReaction?.emoji}</span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="18" height="18">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                  </svg>
                )}
                <span>{myReaction ? currentReaction?.label : "Like"}</span>
              </button>
            </div>

            {/* Comment */}
            <button
              type="button"
              onClick={handleCommentsToggle}
              className={`${styles.actionButton} ${commentsOpen ? styles.activeBtn : ""}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
              <span>Comment</span>
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className={`${styles.actionButton} ${copied ? styles.copiedBtn : ""}`}
            >
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
              )}
              <span>{copied ? "Copied!" : "Share"}</span>
            </button>
          </div>

          {/* Comments Panel */}
          {commentsOpen && (
            <div className={styles.commentsPanel}>
              <div className={styles.commentInputRow}>
                <img
                  src={getUserAvatar(currentUser)}
                  alt="You"
                  className={styles.commentAvatar}
                />
                <div className={styles.commentInputWrap}>
                  <input
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit()}
                    placeholder="Write a comment..."
                    className={styles.commentInput}
                  />
                  <button
                    type="button"
                    onClick={handleCommentSubmit}
                    className={styles.commentSendBtn}
                    title="Post comment"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                  </button>
                </div>
              </div>

              {commentsLoading && (
                <p className={styles.subtleText}>Loading comments...</p>
              )}

              {!commentsLoading && comments.length === 0 && (
                <p className={styles.subtleText}>No comments yet. Be the first!</p>
              )}

              <div className={styles.commentsList}>
                {comments.map((comment) => {
                  const canDelete =
                    comment.userId?._id === currentUser?._id ||
                    post.userId?._id === currentUser?._id;

                  return (
                    <div key={comment._id} className={styles.commentItem}>
                      <img
                        src={getUserAvatar(comment.userId)}
                        alt={comment.userId?.name || "User"}
                        className={styles.commentAvatar}
                      />
                      <div className={styles.commentBubble}>
                        <div className={styles.commentHeader}>
                          <p className={styles.commentName}>{comment.userId?.name}</p>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() =>
                                dispatch(
                                  deleteComment({ postId: post._id, commentId: comment._id })
                                )
                              }
                              className={styles.deleteCommentBtn}
                              title="Delete comment"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="14" height="14">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <span className={styles.commentText}>{comment.body}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}