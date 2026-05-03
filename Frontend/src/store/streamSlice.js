// store/streamSlice.js
import { createSlice } from "@reduxjs/toolkit";

const streamSlice = createSlice({
  name: "stream",
  initialState: {
    messageNotifications: [],
  },
  reducers: {
    addMessageNotification: (state, action) => {
      state.messageNotifications.unshift(action.payload);
    },
    markAllRead: (state) => {
      state.messageNotifications = state.messageNotifications.map((n) => ({
        ...n,
        read: true,
      }));
    },
    clearNotifications: (state) => {
      state.messageNotifications = [];
    },
  },
});

export const { addMessageNotification, markAllRead, clearNotifications } =
  streamSlice.actions;
export default streamSlice.reducer;
