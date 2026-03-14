import type { PayloadAction} from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { loadAuthSession } from '@/shared/lib/auth-session';
import { StateNameType } from '@/shared/redux';

type AuthState = {
  isVerified: boolean;
  reddyUserKey: string;
  verifiedAtMs: number | null;
};

function getInitialState(): AuthState {
  const base: AuthState = {
    isVerified: false,
    reddyUserKey: '',
    verifiedAtMs: null,
  };
  if (typeof window === 'undefined') {
    return base;
  }
  const session = loadAuthSession();
  if (!session) {
    return base;
  }
  return {
    isVerified: true,
    reddyUserKey: session.reddyUserKey,
    verifiedAtMs: session.verifiedAtMs,
  };
}

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: StateNameType.AUTH,
  initialState,
  reducers: {
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

export const { setVerified, resetAuth } = authSlice.actions;
export default authSlice.reducer;
