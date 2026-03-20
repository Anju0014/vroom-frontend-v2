'use client';
import { create } from 'zustand';
import { IUser } from '../../types/authTypes';

interface AuthStateAdmin {
  user: IUser | null;
  accessTokenAdmin: string | null;
  setAuthAdmin: (user: IUser|null, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStoreAdmin = create<AuthStateAdmin>((set) => ({
  user: null,
  accessTokenAdmin: null,
  setAuthAdmin: (user, accessToken) => set({ user, accessTokenAdmin: accessToken }),
  logout: () => set({ user: null, accessTokenAdmin: null }),
}));
