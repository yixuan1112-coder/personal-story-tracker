import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// TODO: Import storiesAPI when implemented

const initialState = {
  stories: {},
  currentStory: null,
  loading: false,
  error: null,
};

const storiesSlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentStory: (state) => {
      state.currentStory = null;
    },
  },
});

export const { clearError, clearCurrentStory } = storiesSlice.actions;
export default storiesSlice.reducer;