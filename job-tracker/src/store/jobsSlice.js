import { createSlice } from '@reduxjs/toolkit';

export const jobsSlice = createSlice({
  name: 'jobs',
  initialState: {
    items: [
      {
        id: crypto.randomUUID(), 
        company: "Tech Corp",
        title: "Frontend Developer",
        dateApplied: "2026-06-23",
        status: "Applied", 
        workModel: "Hybrid", 
        link: "https://example.com/job",
        requirements: "Must know React and Vite." 
      }
    ]
  },
  reducers: {
    addJob: (state, action) => {
      state.items.unshift(action.payload); 
    }
  }
});

export const { addJob } = jobsSlice.actions;
export default jobsSlice.reducer;