import {createSlice} from '@reduxjs/toolkit';

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: undefined,
    email: undefined,
  },
  reducers: {
    login: (state, action) => {
      state.token = action.payload.token;
      state.email = action.payload.email;
    },
    logout: state => {
      state.token = undefined;
      state.email = undefined;
    },
  },
});

export const {login, logout} = authSlice.actions;

export const getEmail = state => state.auth.email;
export const getToken = state => state.auth.token;

export const isLoggedIn = state => {
  if (state.auth.token) {
    return true;
  }
  return false;
};

export default authSlice.reducer;
