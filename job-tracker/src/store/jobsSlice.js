import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/jobs`);
      if (!response.ok) throw new Error('Failed to fetch jobs from server');
      const data = await response.json();
      return data; 
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      
      if (!response.ok) throw new Error('Failed to update job');
      return await response.json(); 
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const jobsSlice = createSlice({
  name: 'jobs',
  initialState: {
    items: [], 
    status: 'idle', 
    error: null
  },
  reducers: {
    addJob: (state, action) => {
      state.items.unshift(action.payload); 
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload; 
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; 
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.items.findIndex(job => job._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      }); 
  }
});

export const { addJob } = jobsSlice.actions;
export default jobsSlice.reducer;