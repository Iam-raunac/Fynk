import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post(`/login`, {
        email: user.email,
        password: user.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      } else {
        return thunkAPI.rejectWithValue({
          message: "token not provided",
        });
      }

      return thunkAPI.fulfillWithValue(response.data.token);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Server error" }
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/register", {
        username: user.username,
        password: user.password,
        email: user.email,
        name: user.name,
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Server error" }
      );
    }
  }
);

export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",
  async (user = {}, thunkAPI) => {
    try {
      const response = await clientServer.get("/get_user_and_profile", {
        params: {
          token: user.token || getToken(),
        },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Could not fetch profile" }
      );
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (params = {}, thunkAPI) => {
    try {
      const response = await clientServer.get("/users/get_all_users", {
        params: {
          token: getToken(),
          search: params.search || "",
          page: params.page || 1,
          limit: params.limit || 20,
          excludeMe: params.excludeMe || false,
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Could not fetch users" }
      );
    }
  }
);

export const getProfileByUsername = createAsyncThunk(
  "user/getProfileByUsername",
  async (username, thunkAPI) => {
    try {
      const response = await clientServer.get(`/profile/${username}`, {
        params: {
          token: getToken(),
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Could not fetch profile" }
      );
    }
  }
);

export const updateProfileData = createAsyncThunk(
  "user/updateProfileData",
  async (profileData, thunkAPI) => {
    try {
      const response = await clientServer.post("/update_profile_data", {
        token: getToken(),
        ...profileData,
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Could not update profile" }
      );
    }
  }
);

export const updateUserData = createAsyncThunk(
  "user/updateUserData",
  async (userData, thunkAPI) => {
    try {
      const response = await clientServer.post("/user_update", {
        token: getToken(),
        ...userData,
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Could not update user" }
      );
    }
  }
);

export const uploadProfilePicture = createAsyncThunk(
  "user/uploadProfilePicture",
  async (file, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("token", getToken());
      formData.append("profile_picture", file);

      const response = await clientServer.post("/update_profile_picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Could not upload profile picture" }
      );
    }
  }
);

export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async (connectionId, thunkAPI) => {
    try {
      const response = await clientServer.post("/user/send_connection_request", {
        token: getToken(),
        connectionId,
      });

      return thunkAPI.fulfillWithValue({ connectionId, ...response.data });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Could not send request" }
      );
    }
  }
);

export const getIncomingConnectionRequests = createAsyncThunk(
  "user/getIncomingConnectionRequests",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/user_connection_request", {
        params: { token: getToken() },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Could not fetch requests" }
      );
    }
  }
);

export const getSentConnectionRequests = createAsyncThunk(
  "user/getSentConnectionRequests",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/getConnectionRequest", {
        params: { token: getToken() },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Could not fetch sent requests" }
      );
    }
  }
);

export const getAcceptedConnections = createAsyncThunk(
  "user/getAcceptedConnections",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/connections", {
        params: { token: getToken() },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Could not fetch connections" }
      );
    }
  }
);

export const respondConnectionRequest = createAsyncThunk(
  "user/respondConnectionRequest",
  async ({ requestId, actionType }, thunkAPI) => {
    try {
      const response = await clientServer.post("/user/accept_connection_request", {
        token: getToken(),
        requestId,
        action_type: actionType,
      });

      return thunkAPI.fulfillWithValue({ requestId, actionType, ...response.data });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Could not update request" }
      );
    }
  }
);
