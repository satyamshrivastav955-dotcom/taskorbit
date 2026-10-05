import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState { unreadCount: number; }

const initialState: UiState = { unreadCount: 0 };

const slice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setUnread(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
  },
});

export const { setUnread } = slice.actions;
export default slice.reducer;
