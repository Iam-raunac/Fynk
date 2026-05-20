import { getAboutUser, getAllUsers } from "@/config/redux/action/authAction";
import { createPost, getAllPosts } from "@/config/redux/action/postAction";
import PostCard from "@/components/PostCard";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import { getUserAvatar } from "@/utils/media";

export default function Dashboard() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.postReducer);

  const [postContent, setPostContent] = useState("");
  const [fileContent, setFileContent] = useState(null);

  useEffect(() => {
    if (authState.isTokenThere) {
      dispatch(getAboutUser({ token: localStorage.getItem("token") }));
      dispatch(getAllPosts());
    }
  }, [authState.isTokenThere, dispatch]);

  useEffect(() => {
    if (!authState.all_profiles_fetched && authState.isTokenThere) {
      dispatch(getAllUsers({ limit: 8 }));
    }
  }, [authState.all_profiles_fetched, authState.isTokenThere, dispatch]);

  const handleUpload = async () => {
    if (!postContent.trim() && !fileContent) return;

    await dispatch(createPost({ file: fileContent, body: postContent }));
    setPostContent("");
    setFileContent(null);
    dispatch(getAllPosts());
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.scrollComponent}>
          <div className={styles.wrapper}>
            {authState.user ? (
              <div className={styles.createPostContainer}>
                <img
                  className={styles.userProfile}
                  src={getUserAvatar(authState.user.userId)}
                  alt={authState.user.userId.name}
                />
                <textarea
                  onChange={(e) => setPostContent(e.target.value)}
                  value={postContent}
                  placeholder={"What's in your mind?"}
                  className={styles.textarea}
                />
                <label htmlFor="fileUpload">
                  <div className={styles.Fab}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                </label>
                <input
                  onChange={(e) => setFileContent(e.target.files?.[0] || null)}
                  type="file"
                  hidden
                  id="fileUpload"
                />
                {(postContent.trim().length > 0 || fileContent) && (
                  <div onClick={handleUpload} className={styles.uploadButton}>
                    {postState.isPosting ? "Posting..." : "Post"}
                  </div>
                )}
              </div>
            ) : (
              <h2>Loading...</h2>
            )}

            {fileContent && (
              <div className={styles.filePreview}>
                <span>{fileContent.name}</span>
                <button type="button" onClick={() => setFileContent(null)}>
                  Remove
                </button>
              </div>
            )}

            <div className={styles.feedContainer}>
              {postState.isLoading && postState.posts.length === 0 && <h2>Loading...</h2>}

              {!postState.isLoading && postState.posts.length === 0 && (
                <p className={styles.emptyState}>No posts yet</p>
              )}

              {postState.posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUser={authState.user?.userId}
                />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
