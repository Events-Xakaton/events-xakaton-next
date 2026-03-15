import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { StateNameType } from '@/shared/redux';

export type AppTab = 'home' | 'create' | 'notifications' | 'points' | 'account';
export type DetailView = {
  entityType: 'event' | 'club';
  entityId: string;
} | null;

const uiSlice = createSlice({
  name: StateNameType.UI,
  initialState: {
    tab: 'home' as AppTab,
    homeKind: 'events' as 'events' | 'clubs',
    detail: null as DetailView,
    // Актуальный аватар текущего пользователя (iconUrl активной ачивки или null).
    // Синхронизируется из AchievementProvider, читается через useCurrentUserAvatar.
    currentUserAvatarUrl: null as string | null,
  },
  reducers: {
    setTab(state, action: PayloadAction<AppTab>) {
      state.tab = action.payload;
    },
    setHomeKind(state, action: PayloadAction<'events' | 'clubs'>) {
      state.homeKind = action.payload;
    },
    openEventDetail(state, action: PayloadAction<{ eventId: string }>) {
      state.detail = { entityType: 'event', entityId: action.payload.eventId };
    },
    openClubDetail(state, action: PayloadAction<{ clubId: string }>) {
      state.detail = { entityType: 'club', entityId: action.payload.clubId };
    },
    closeDetail(state) {
      state.detail = null;
    },
    setCurrentUserAvatarUrl(state, action: PayloadAction<string | null>) {
      state.currentUserAvatarUrl = action.payload;
    },
  },
});

export const {
  setTab,
  setHomeKind,
  openEventDetail,
  openClubDetail,
  closeDetail,
  setCurrentUserAvatarUrl,
} = uiSlice.actions;
export default uiSlice.reducer;
