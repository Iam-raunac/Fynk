import { createSlice } from "@reduxjs/toolkit";
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  getAllPosts,
  getCommentsByPost,
  togglePostLike,
} from "../../action/postAction";

const initialState = {
  posts: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },
  commentsByPost: {},
  commentsLoadingByPost: {},
  isError: false,
  postFetched: false,
  isLoading: false,
  isPosting: false,
  message: "",
};

const updatePost = (state, postId, updater) => {
  const post = state.posts.find((item) => item._id === postId);
  if (post) updater(post);
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    reset: () => initialState,
    clearPostMessage: (state) => {
      state.message = "";
      state.isError = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPosts.pending, (state) => {
        state.isLoading = true;
        state.message = "Fetching all the posts...";
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.postFetched = true;
        state.posts = action.payload.posts || [];
        state.pagination = action.payload.pagination || initialState.pagination;
        state.message = "All posts fetched successfully";
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || "Could not fetch posts";
      })
      .addCase(createPost.pending, (state) => {
        state.isPosting = true;
      })
      .addCase(createPost.fulfilled, (state) => {
        state.isPosting = false;
        state.message = "Post Uploaded";
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isPosting = false;
        state.isError = true;
        state.message = action.payload?.message || "Error Uploading Post";
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((post) => post._id !== action.payload.post_id);
      })
      .addCase(togglePostLike.fulfilled, (state, action) => {
        updatePost(state, action.payload.postId, (post) => {
          post.likedByMe = action.payload.liked;
          post.likeCount = action.payload.likeCount;
          post.likes = action.payload.likeCount;
        });
      })
      .addCase(getCommentsByPost.pending, (state, action) => {
        state.commentsLoadingByPost[action.meta.arg] = true;
      })
      .addCase(getCommentsByPost.fulfilled, (state, action) => {
        state.commentsLoadingByPost[action.payload.postId] = false;
        state.commentsByPost[action.payload.postId] = action.payload.comments || [];
      })
      .addCase(getCommentsByPost.rejected, (state, action) => {
        state.commentsLoadingByPost[action.meta.arg] = false;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        const comments = state.commentsByPost[postId] || [];
        state.commentsByPost[postId] = [comment, ...comments];
        updatePost(state, postId, (post) => {
          post.commentCount = (post.commentCount || 0) + 1;
        });
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;
        state.commentsByPost[postId] = (state.commentsByPost[postId] || []).filter(
          (comment) => comment._id !== commentId
        );
        updatePost(state, postId, (post) => {
          post.commentCount = Math.max(0, (post.commentCount || 0) - 1);
        });
      });
  },
});

export const { reset, clearPostMessage } = postSlice.actions;

export default postSlice.reducer;
