import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface LearningState {
  counter: number;
  message: string;
  items: string[];
  lastAction: string;
}

const initialState: LearningState = {
  counter: 0,
  message: 'Hello from Redux Toolkit!',
  items: [
    'Store: Holds entire application state tree',
    'Action: Plain object describing what happened',
    'Reducer: Pure function (state, action) => newState',
    'useDispatch: Hook to send actions to store',
    'useSelector: Hook to extract data from store',
  ],
  lastAction: 'INITIALIZED',
};

const slice = createSlice({
  name: 'learning',
  initialState,
  reducers: {
    increment(state) {
      state.counter += 1;
      state.lastAction = 'INCREMENT';
    },
    decrement(state) {
      state.counter -= 1;
      state.lastAction = 'DECREMENT';
    },
    resetCounter(state) {
      state.counter = 0;
      state.lastAction = 'RESET_COUNTER';
    },
    setMessage(state, action: PayloadAction<string>) {
      state.message = action.payload;
      state.lastAction = 'SET_MESSAGE';
    },
    addItem(state, action: PayloadAction<string>) {
      const trimmed = action.payload.trim();
      if (trimmed) {
        state.items.push(trimmed);
        state.lastAction = `ADD_ITEM ("${trimmed}")`;
      }
    },
    removeItem(state, action: PayloadAction<number>) {
      const removed = state.items.splice(action.payload, 1);
      state.lastAction = `REMOVE_ITEM ("${removed[0] ?? ''}")`;
    },
  },
});

export const { increment, decrement, resetCounter, setMessage, addItem, removeItem } = slice.actions;
export default slice.reducer;
