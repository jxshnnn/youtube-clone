import { createSlice } from '@reduxjs/toolkit';

const stored = localStorage.getItem('accessToken');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: stored || null,
    isLoggedIn: !!stored,
    loading: false,
    error: null,
  },
  reducers: {
    setCredentials(state, action) {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isLoggedIn = true;
      if (accessToken) localStorage.setItem('accessToken', accessToken);
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    clearCredentials(state) {
      state.user = null;
      state.accessToken = null;
      state.isLoggedIn = false;
      localStorage.removeItem('accessToken');
    },
    setAuthLoading(state, action) {
      state.loading = action.payload;
    },
    setAuthError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setCredentials, setUser, clearCredentials, setAuthLoading, setAuthError } = authSlice.actions;
export default authSlice.reducer;
