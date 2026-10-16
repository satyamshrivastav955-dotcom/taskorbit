import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Role } from '../types';

import { clearDevSession } from '../services/devAuth';

interface SessionState {
  uid: string;
  email: string;
  name: string;
  role: Role | '';
  ready: boolean;
}

const initialState: SessionState = { uid: '', email: '', name: '', role: '', ready: false };

const slice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<Omit<SessionState, 'ready'>>) {
      state.uid = action.payload.uid;
      state.email = action.payload.email;
      state.name = action.payload.name;
      state.role = action.payload.role;
      state.ready = true;
    },
    clearSession(state) {
      state.uid = '';
      state.email = '';
      state.name = '';
      state.role = '';
      state.ready = true;
      clearDevSession();
    },
  },
});

export const { setSession, clearSession } = slice.actions;
export default slice.reducer;
