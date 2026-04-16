import { createSlice } from '@reduxjs/toolkit';

const videoSlice = createSlice({
  name: 'video',
  initialState: {
    videos: [],
    currentVideo: null,
    loading: false,
    pagination: { currentPage: 1, totalPages: 1, totalVideos: 0 },
    error: null,
  },
  reducers: {
    setVideos(state, action) {
      state.videos = action.payload.videos || [];
      state.pagination = {
        currentPage: action.payload.currentPage || 1,
        totalPages: action.payload.totalPages || 1,
        totalVideos: action.payload.totalVideos || 0,
      };
    },
    appendVideos(state, action) {
      state.videos = [...state.videos, ...(action.payload.videos || [])];
      state.pagination = {
        currentPage: action.payload.currentPage || 1,
        totalPages: action.payload.totalPages || 1,
        totalVideos: action.payload.totalVideos || 0,
      };
    },
    setCurrentVideo(state, action) {
      state.currentVideo = action.payload;
    },
    setVideoLoading(state, action) {
      state.loading = action.payload;
    },
    setVideoError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    clearVideos(state) {
      state.videos = [];
      state.pagination = { currentPage: 1, totalPages: 1, totalVideos: 0 };
    },
  },
});

export const { setVideos, appendVideos, setCurrentVideo, setVideoLoading, setVideoError, clearVideos } = videoSlice.actions;
export default videoSlice.reducer;
