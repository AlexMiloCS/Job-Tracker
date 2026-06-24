import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import authReducer from './authSlice';
import jobsReducer from './jobsSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    jobs: jobsReducer
  },
});