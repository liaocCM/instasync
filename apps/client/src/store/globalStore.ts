import { Room, RoomMode } from '@instasync/shared';
import { create } from 'zustand';

interface GlobalState {
  room: Room | null;
  uiRoomMode: RoomMode;
  loading: boolean;
}

interface GlobalStore extends GlobalState {
  setState: (state: Partial<GlobalState>) => void;
  setLoading: (loading: boolean) => void;
}

export const useGlobalStore = create<GlobalStore>((set) => ({
  room: null,
  uiRoomMode: RoomMode.VIDEO,
  loading: false,
  setState: (state) => {
    set({ ...state });

    if (state.uiRoomMode) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('mode', state.uiRoomMode.toLowerCase());
      const newUrl = `${location.pathname}?${searchParams.toString()}`;
      history.replaceState({ path: newUrl }, '', newUrl);
    }
  },
  setLoading: (loading) => set({ loading })
}));
