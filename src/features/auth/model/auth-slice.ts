import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { StateNameType } from '@/shared/redux';

type AuthState = {
  // true пока async-проверка CloudStorage ещё не завершилась
  isInitializing: boolean;
  isVerified: boolean;
  reddyUserKey: string;
  verifiedAtMs: number | null;
};

const initialState: AuthState = {
  isInitializing: true,
  isVerified: false,
  reddyUserKey: '',
  verifiedAtMs: null,
};

const authSlice = createSlice({
  name: StateNameType.AUTH,
  initialState,
  reducers: {
    /**
     * Вызывается после завершения async-загрузки сессии из CloudStorage/localStorage.
     * session === null означает, что сессии нет.
     */
    setInitialized(
      state,
      action: PayloadAction<{
        reddyUserKey: string;
        verifiedAtMs: number;
      } | null>,
    ) {
      state.isInitializing = false;
      if (action.payload) {
        state.isVerified = true;
        state.reddyUserKey = action.payload.reddyUserKey;
        state.verifiedAtMs = action.payload.verifiedAtMs;
      }
    },
    setVerified(
      state,
      action: PayloadAction<{ reddyUserKey: string; verifiedAtMs?: number }>,
    ) {
      state.isVerified = true;
      state.reddyUserKey = action.payload.reddyUserKey;
      state.verifiedAtMs = action.payload.verifiedAtMs ?? Date.now();
    },
    resetAuth(state) {
      state.isVerified = false;
      state.reddyUserKey = '';
      state.verifiedAtMs = null;
    },
  },
});

export const { setInitialized, setVerified, resetAuth } = authSlice.actions;
export default authSlice.reducer;
