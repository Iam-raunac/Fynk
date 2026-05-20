import { createSlice } from "@reduxjs/toolkit";
import {
  getAboutUser,
  getAcceptedConnections,
  getAllUsers,
  getIncomingConnectionRequests,
  getProfileByUsername,
  getSentConnectionRequests,
  loginUser,
  registerUser,
  respondConnectionRequest,
  sendConnectionRequest,
  updateProfileData,
  updateUserData,
  uploadProfilePicture,
} from "../../action/authAction";

const initialState = {
  user: undefined,
  viewedProfile: undefined,
  viewedProfileLoading: false,
  isError: false,
  isSuccess: false,
  isLoading: false,
  loggedIn: false,
  message: "",
  isTokenThere: false,
  profileFetched: false,
  connections: [],
  sentConnectionRequests: [],
  connectionRequests: [],
  all_users: [],
  usersPagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },
  all_profiles_fetched: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,
    handleLoginUser: (state) => {
      state.message = "hello";
    },
    emptyMessage: (state) => {
      state.message = "";
      state.isError = false;
    },
    setTokenIsThere: (state) => {
      state.isTokenThere = true;
    },
    setTokenIsNotThere: (state) => {
      state.isTokenThere = false;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Knocking the door";
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.message = "Login is successful";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || { message: "Login failed" };
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Registering you...";
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = false;
        state.message = {
          message: "Registration is successful, Please Login",
        };
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || { message: "Registration failed" };
      })
      .addCase(getAboutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.profileFetched = true;
        state.user = action.payload;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.all_profiles_fetched = true;
        state.all_users = action.payload.profiles || [];
        state.usersPagination = action.payload.pagination || initialState.usersPagination;
      })
      .addCase(getProfileByUsername.pending, (state) => {
        state.viewedProfileLoading = true;
      })
      .addCase(getProfileByUsername.fulfilled, (state, action) => {
        state.viewedProfileLoading = false;
        state.viewedProfile = action.payload;
      })
      .addCase(getProfileByUsername.rejected, (state, action) => {
        state.viewedProfileLoading = false;
        state.isError = true;
        state.message = action.payload || { message: "Could not fetch profile" };
      })
      .addCase(updateProfileData.fulfilled, (state, action) => {
        if (state.user) {
          state.user = {
            ...state.user,
            ...action.payload.profile,
            userId: state.user.userId,
          };
        }
      })
      .addCase(updateUserData.fulfilled, (state) => {
        state.message = { message: "User Updated" };
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        if (state.user?.userId) {
          state.user.userId.profilePicture = action.payload.profilePicture;
        }
      })
      .addCase(sendConnectionRequest.fulfilled, (state, action) => {
        state.all_users = state.all_users.map((profile) =>
          profile.userId?._id === action.payload.connectionId
            ? { ...profile, connectionStatus: "pending_sent" }
            : profile
        );
        if (state.viewedProfile?.profile?.userId?._id === action.payload.connectionId) {
          state.viewedProfile.profile.connectionStatus = "pending_sent";
        }
      })
      .addCase(getIncomingConnectionRequests.fulfilled, (state, action) => {
        state.connectionRequests = action.payload.connections || [];
      })
      .addCase(getSentConnectionRequests.fulfilled, (state, action) => {
        state.sentConnectionRequests = action.payload.connections || [];
      })
      .addCase(getAcceptedConnections.fulfilled, (state, action) => {
        state.connections = action.payload.connections || [];
      })
      .addCase(respondConnectionRequest.fulfilled, (state, action) => {
        state.connectionRequests = state.connectionRequests.filter(
          (request) => request._id !== action.payload.requestId
        );
      });
  },
});

export const {
  reset,
  emptyMessage,
  setTokenIsThere,
  setTokenIsNotThere,
} = authSlice.actions;

export default authSlice.reducer;
