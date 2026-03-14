import type { PayloadAction} from '@reduxjs/toolkit';
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
  },
});

export const {
  setTab,
  setHomeKind,
  openEventDetail,
  openClubDetail,
  closeDetail,
} = uiSlice.actions;
export default uiSlice.reducer;
