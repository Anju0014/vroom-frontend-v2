'use client';
import { create } from 'zustand';
import { IUser } from '../../types/authTypes';

interface AuthStateOwner {
  user: IUser | null;
  accessTokenOwner: string | null;
  setAuthOwner: (user: IUser|null, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStoreOwner = create<AuthStateOwner>((set) => ({
  user: null,
  accessTokenOwner: null,
  setAuthOwner: (user, accessToken) => set({ user, accessTokenOwner: accessToken }),
  logout: () => set({ user: null, accessTokenOwner: null }),
}));
