import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies (accessToken, refreshToken)
});

// ── Request interceptor: attach accessToken from localStorage if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 — try token refresh once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${BASE_URL}/users/refresh-token`,
          {},
          { withCredentials: true }
        );
        const newToken = res.data?.data?.accessToken;
        if (newToken) {
          localStorage.setItem('accessToken', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (_err) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/* ─── Auth ─────────────────────────────────────────────────── */
export const registerUser   = (formData) => api.post('/users/register', formData);
export const loginUser      = (data)     => api.post('/users/login', data);
export const logoutUser     = ()         => api.post('/users/logout');
export const getCurrentUser = ()         => api.get('/users/current-user');
export const updateAccount  = (data)     => api.patch('/users/update-account', data);
export const updateAvatar   = (formData) => api.patch('/users/avatar', formData);
export const updateCoverImage = (formData) => api.patch('/users/cover-image', formData);
export const changePassword = (data)     => api.post('/users/change-password', data);
export const getChannelProfile = (username) => api.get(`/users/c/${username}`);
export const getWatchHistory   = ()      => api.get('/users/history');

/* ─── Videos ────────────────────────────────────────────────── */
export const getAllVideos    = (params) => api.get('/videos', { params });
export const getVideoById   = (videoId) => api.get(`/videos/${videoId}`);
export const publishVideo   = (formData) => api.post('/videos', formData);
export const updateVideo    = (videoId, data) => api.patch(`/videos/${videoId}`, data);
export const deleteVideo    = (videoId) => api.delete(`/videos/${videoId}`);
export const togglePublish  = (videoId) => api.patch(`/videos/toggle/publish/${videoId}`);

/* ─── Subscriptions ─────────────────────────────────────────── */
export const toggleSubscription   = (channelId) => api.post(`/subscriptions/c/${channelId}`);
export const getChannelSubscribers = (channelId) => api.get(`/subscriptions/c/${channelId}`);
export const getSubscribedChannels = (subscriberId) => api.get(`/subscriptions/u/${subscriberId}`);

/* ─── Likes ─────────────────────────────────────────────────── */
export const toggleVideoLike   = (videoId)   => api.post(`/likes/toggle/v/${videoId}`);
export const toggleCommentLike = (commentId) => api.post(`/likes/toggle/c/${commentId}`);
export const toggleTweetLike   = (tweetId)   => api.post(`/likes/toggle/t/${tweetId}`);
export const getLikedVideos    = ()          => api.get('/likes/videos');

/* ─── Comments ──────────────────────────────────────────────── */
export const getComments   = (videoId, params) => api.get(`/comments/${videoId}`, { params });
export const addComment    = (videoId, data)   => api.post(`/comments/${videoId}`, data);
export const updateComment = (commentId, data) => api.patch(`/comments/c/${commentId}`, data);
export const deleteComment = (commentId)       => api.delete(`/comments/c/${commentId}`);

/* ─── Playlists ─────────────────────────────────────────────── */
export const createPlaylist        = (data)                   => api.post('/playlists', data);
export const getPlaylistById       = (playlistId)             => api.get(`/playlists/${playlistId}`);
export const updatePlaylist        = (playlistId, data)       => api.patch(`/playlists/${playlistId}`, data);
export const deletePlaylist        = (playlistId)             => api.delete(`/playlists/${playlistId}`);
export const getUserPlaylists      = (userId)                 => api.get(`/playlists/user/${userId}`);
export const addVideoToPlaylist    = (playlistId, videoId)    => api.patch(`/playlists/add/${videoId}/${playlistId}`);
export const removeVideoFromPlaylist = (playlistId, videoId)  => api.patch(`/playlists/remove/${videoId}/${playlistId}`);

/* ─── Tweets ────────────────────────────────────────────────── */
export const createTweet   = (data)      => api.post('/tweets', data);
export const getUserTweets = (userId)    => api.get(`/tweets/user/${userId}`);
export const updateTweet   = (tweetId, data) => api.patch(`/tweets/${tweetId}`, data);
export const deleteTweet   = (tweetId)  => api.delete(`/tweets/${tweetId}`);

/* ─── Dashboard ─────────────────────────────────────────────── */
export const getChannelStats  = () => api.get('/dashboard/stats');
export const getChannelVideos = () => api.get('/dashboard/videos');

export default api;
