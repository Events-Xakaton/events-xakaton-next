import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import authReducer from '@/features/auth/model/auth-slice';

import { apiBase } from '@/shared/api/base-api';

import uiReducer from './slices/ui-slice';

export const store = configureStore({
  reducer: {
    [apiBase.reducerPath]: apiBase.reducer,
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiBase.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
