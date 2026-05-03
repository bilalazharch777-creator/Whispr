import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./themeSlice";
import streamReducer from "./streamSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    stream: streamReducer,
  },
});
