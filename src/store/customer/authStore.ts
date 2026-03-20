'use client';
import { create } from 'zustand';
import { IUser } from '../../types/authTypes';

interface AuthState {
  user: IUser | null;
  accessToken: string | null; // in-memory only
  setAuth: (user: IUser|null, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  logout: () => set({ user: null, accessToken: null }),
}));
