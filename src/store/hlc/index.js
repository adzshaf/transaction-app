import {createSlice} from '@reduxjs/toolkit';
import {getUniqueId} from 'react-native-device-info';

export const hlcSlice = createSlice({
  name: 'hlc',
  initialState: {
    ts: Math.round(new Date().getTime() / 1000),
    node: getUniqueId(),
    count: 0,
  },
  reducers: {
    update: (state, action) => {
      state.ts = action.payload.ts;
      state.count = action.payload.count;
      state.node = action.payload.node;
    },
  },
});

export const {update} = hlcSlice.actions;

export const getTs = state => state.hlc.ts;
export const getNode = state => state.hlc.node;
export const getCount = state => state.hlc.count;

export default hlcSlice.reducer;
