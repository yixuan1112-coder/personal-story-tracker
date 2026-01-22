import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import entriesReducer from './slices/entriesSlice';
import storiesReducer from './slices/storiesSlice';
import valuationsReducer from './slices/valuationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    entries: entriesReducer,
    stories: storiesReducer,
    valuations: valuationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});