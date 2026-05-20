import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

export const getAllPosts = createAsyncThunk(
  "post/getAllPosts",
  async (params = {}, thunkAPI) => {
    try {
      const response = await clientServer.get("/posts", {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          token: getToken(),
        },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Could not fetch posts" }
      );
    }
  }
);

export const createPost = createAsyncThunk(
  "post/createPost",
  async (userData, thunkAPI) => {
    const { file, body } = userData;

    try {
      const formData = new FormData();
      formData.append("token", getToken());
      formData.append("body", body || "");
      if (file) formData.append("media", file);

      const response = await clientServer.post("/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Error Uploading Post" }
      );
    }
  }
);

export const deletePost = createAsyncThunk(
  "post/deletePost",
  async (postId, thunkAPI) => {
    try {
      const response = await clientServer.delete("/delete_post", {
        data: {
          token: getToken(),
          post_id: postId.post_id,
        },
      });
      return thunkAPI.fulfillWithValue({
        ...response.data,
        post_id: postId.post_id,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Could not delete post" }
      );
    }
  }
);

export const togglePostLike = createAsyncThunk(
  "post/togglePostLike",
  async (postId, thunkAPI) => {
    try {
      const response = await clientServer.post("/increment_post_like", {
        token: getToken(),
        post_id: postId,
      });
      return thunkAPI.fulfillWithValue({
        postId,
        ...response.data,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Could not update like" }
      );
    }
  }
);

export const getCommentsByPost = createAsyncThunk(
  "post/getCommentsByPost",
  async (postId, thunkAPI) => {
    try {
      const response = await clientServer.get("/get_comments", {
        params: {
          post_id: postId,
          page: 1,
          limit: 20,
        },
      });
      return thunkAPI.fulfillWithValue({
        postId,
        ...response.data,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Could not fetch comments" }
      );
    }
  }
);

export const createComment = createAsyncThunk(
  "post/createComment",
  async ({ postId, body }, thunkAPI) => {
    try {
      const response = await clientServer.post("/comment", {
        token: getToken(),
        post_id: postId,
        body,
      });
      return thunkAPI.fulfillWithValue({
        postId,
        ...response.data,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Could not add comment" }
      );
    }
  }
);

export const deleteComment = createAsyncThunk(
  "post/deleteComment",
  async ({ postId, commentId }, thunkAPI) => {
    try {
      const response = await clientServer.delete("/delete_comments", {
        data: {
          token: getToken(),
          comment_id: commentId,
        },
      });
      return thunkAPI.fulfillWithValue({
        postId,
        commentId,
        ...response.data,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Could not delete comment" }
      );
    }
  }
);
