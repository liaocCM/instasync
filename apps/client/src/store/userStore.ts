import { User, UserRole } from '@instasync/shared/types';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserStore {
  user?: User;
  computed: {
    isAuthenticated: boolean;
    isAdmin: boolean;
    bearerToken: string;
  };
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: undefined,
      isAdmin: false,
      computed: {
        get isAuthenticated() {
          return !!get().user?.token;
        },
        get isAdmin() {
          return get()?.user?.roles.includes(UserRole.ADMIN) ?? false;
        },
        get bearerToken() {
          return `Bearer ${get().user?.token}`;
        }
      }
      //   login: async (data) => {
      //     const res = await API_SERVICES.login(data);
      //     if (res) {
      //       set({ user: res });
      //     }
      //   },
      //   logout: async () => {
      //     await API_SERVICE.logout({ token: get().user?.token || '' });
      //     set({ user: undefined });
      //   },
      //   verify: async () => await API_SERVICE.verify({ token: get().user?.token || '' })
    }),
    // only user data should be saved in storage
    {
      name: 'cws-auth',
      partialize: (state) => ({ user: state.user })
    }
  )
);
