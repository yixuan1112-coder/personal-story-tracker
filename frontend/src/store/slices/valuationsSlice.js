import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// TODO: Import valuationsAPI when implemented

const initialState = {
  valuations: {},
  currentValuation: null,
  loading: false,
  error: null,
};

const valuationsSlice = createSlice({
  name: 'valuations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentValuation: (state) => {
      state.currentValuation = null;
    },
  },
});

export const { clearError, clearCurrentValuation } = valuationsSlice.actions;
export default valuationsSlice.reducer;