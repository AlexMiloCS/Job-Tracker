import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL;

// Helper to get token
const getAuthHeaders = (getState) => {
  const token = getState().auth.token || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/jobs`, {
        headers: getAuthHeaders(getState)
      });
      if (!response.ok) throw new Error('Failed to fetch jobs from server');
      const data = await response.json();
      return data; 
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addJob = createAsyncThunk(
  'jobs/addJob',
  async (jobData, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: getAuthHeaders(getState),
        body: JSON.stringify(jobData),
      });
      
      if (!response.ok) throw new Error('Failed to create job');
      return await response.json(); 
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async (jobData, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobData._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(getState),
        body: JSON.stringify(jobData),
      });
      
      if (!response.ok) throw new Error('Failed to update job');
      return await response.json(); 
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (jobId, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(getState)
      });
      if (!response.ok) throw new Error('Failed to delete job');
      return jobId;
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
    clearJobs: (state) => {
      state.items = [];
      state.status = 'idle';
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
      .addCase(addJob.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.items.findIndex(job => job._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.items = state.items.filter(job => job._id !== action.payload);
      }); 
  }
});

export const { clearJobs } = jobsSlice.actions;
export default jobsSlice.reducer;