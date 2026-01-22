import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  entries: [],
  currentEntry: null,
  loading: false,
  error: null,
  pagination: {
    count: 0,
    next: null,
    previous: null,
  },
  statistics: null,
};

// 异步操作
export const fetchEntries = createAsyncThunk(
  'entries/fetchEntries',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/entries/', { params });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchEntry = createAsyncThunk(
  'entries/fetchEntry',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/entries/${id}/`);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createEntry = createAsyncThunk(
  'entries/createEntry',
  async (entryData, { rejectWithValue }) => {
    try {
      const response = await api.post('/entries/', entryData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateEntry = createAsyncThunk(
  'entries/updateEntry',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/entries/${id}/`, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteEntry = createAsyncThunk(
  'entries/deleteEntry',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/entries/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateStory = createAsyncThunk(
  'entries/updateStory',
  async ({ id, story_content }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/entries/${id}/update_story/`, { story_content });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchStatistics = createAsyncThunk(
  'entries/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/entries/statistics/');
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const entriesSlice = createSlice({
  name: 'entries',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentEntry: (state) => {
      state.currentEntry = null;
    },
    setCurrentEntry: (state, action) => {
      state.currentEntry = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取条目列表
      .addCase(fetchEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload.results || action.payload;
        state.pagination = {
          count: action.payload.count || 0,
          next: action.payload.next || null,
          previous: action.payload.previous || null,
        };
      })
      .addCase(fetchEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // 获取单个条目
      .addCase(fetchEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEntry = action.payload;
      })
      .addCase(fetchEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // 创建条目
      .addCase(createEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.entries.unshift(action.payload);
        state.currentEntry = action.payload;
      })
      .addCase(createEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // 更新条目
      .addCase(updateEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEntry.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.entries.findIndex(entry => entry.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
        if (state.currentEntry && state.currentEntry.id === action.payload.id) {
          state.currentEntry = action.payload;
        }
      })
      .addCase(updateEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // 删除条目
      .addCase(deleteEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = state.entries.filter(entry => entry.id !== action.payload);
        if (state.currentEntry && state.currentEntry.id === action.payload) {
          state.currentEntry = null;
        }
      })
      .addCase(deleteEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // 更新故事
      .addCase(updateStory.fulfilled, (state, action) => {
        if (state.currentEntry && state.currentEntry.id === action.payload.id) {
          state.currentEntry.story_content = action.payload.story_content;
          state.currentEntry.story_last_modified = action.payload.story_last_modified;
          state.currentEntry.has_story = action.payload.has_story;
        }
      })
      
      // 获取统计信息
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      });
  },
});

export const { clearError, clearCurrentEntry, setCurrentEntry } = entriesSlice.actions;
export default entriesSlice.reducer;