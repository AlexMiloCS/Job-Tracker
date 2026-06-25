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

export const reclusterJobs = createAsyncThunk(
  'jobs/reclusterJobs',
  async ({ autoName = false } = {}, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/cluster/recluster`, {
        method: 'POST',
        headers: getAuthHeaders(getState),
        body: JSON.stringify({ autoName }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to recluster');
      }
      const data = await response.json();
      return data.jobs;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const autoNameClusters = createAsyncThunk(
  'jobs/autoNameClusters',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/cluster/auto-name`, {
        method: 'POST',
        headers: getAuthHeaders(getState),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to auto-name clusters');
      }
      const data = await response.json();
      return data.jobs;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const renameCluster = createAsyncThunk(
  'jobs/renameCluster',
  async ({ clusterId, newLabel }, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/cluster/rename`, {
        method: 'POST',
        headers: getAuthHeaders(getState),
        body: JSON.stringify({ clusterId, newLabel }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to rename cluster');
      }
      return { clusterId, newLabel };
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
    error: null,
    activeFilters: []
  },
  reducers: {
    clearJobs: (state) => {
      state.items = [];
      state.status = 'idle';
      state.activeFilters = [];
    },
    toggleFilter: (state, action) => {
      const { type, value } = action.payload;
      const index = state.activeFilters.findIndex(f => f.type === type && f.value === value);
      if (index === -1) {
        state.activeFilters.push({ type, value });
      } else {
        state.activeFilters.splice(index, 1);
      }
    },
    clearFilters: (state) => {
      state.activeFilters = [];
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
      })
      .addCase(reclusterJobs.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(autoNameClusters.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(renameCluster.fulfilled, (state, action) => {
        const { clusterId, newLabel } = action.payload;
        state.items.forEach(job => {
          if (job.clusterId === clusterId) {
            job.clusterLabel = newLabel;
          }
        });
      }); 
  }
});

export const { clearJobs, toggleFilter, clearFilters } = jobsSlice.actions;
export default jobsSlice.reducer;