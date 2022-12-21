import {createSlice} from '@reduxjs/toolkit';

export const timerSlice = createSlice({
  name: 'timer',
  initialState: {
    time: null,
  },
  reducers: {
    startTimer: state => {
      state.time = new Date().getTime();
    },
    endTimer: state => {
      let endTime = new Date().getTime();
      let costTime = (endTime - state.time) / 1000;
      state.time = costTime;
    },
  },
});

export const {startTimer, endTimer} = timerSlice.actions;

export const getTime = state => state.timer.time;

export default timerSlice.reducer;
