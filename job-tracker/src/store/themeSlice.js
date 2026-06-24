import { createSlice } from '@reduxjs/toolkit';

const initialDark = localStorage.getItem('dark-mode') === 'true';
if (initialDark) {
  document.body.classList.add('dark-theme');
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    isDarkMode: initialDark,
  },
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode; 
      
      localStorage.setItem('dark-mode', String(state.isDarkMode));
      if (state.isDarkMode) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;