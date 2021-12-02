import {createSlice} from '@reduxjs/toolkit';

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: undefined,
    email: undefined,
    accessToken: undefined,
  },
  reducers: {
    login: (state, action) => {
      state.token = action.payload.token;
      state.email = action.payload.email;
      state.accessToken = action.payload.accessToken;
    },
    logout: state => {
      state.token = undefined;
      state.email = undefined;
      state.accessToken = undefined;
    },
    updateToken: (state, action) => {
      state.token = action.payload.token;
      state.accessToken = action.payload.accessToken;
    },
  },
});

export const {login, logout, updateToken} = authSlice.actions;

export const getEmail = state => state.auth.email;
export const getToken = state => state.auth.token;
export const getAccessToken = state => state.auth.accessToken;

export const isLoggedIn = state => {
  if (state.auth.token) {
    return true;
  }
  return false;
};

export default authSlice.reducer;
