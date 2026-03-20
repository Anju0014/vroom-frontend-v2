import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/customer/authStore';
import { useAuthStoreOwner } from '@/store/carOwner/authStore';
import { useAuthStoreAdmin } from '@/store/admin/authStore';
import { IUser } from '@/types/authTypes';


const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});


const getStoreByUrl = (url: string) => {
  if (url.startsWith('/admin')|| url.includes('/admin')) return useAuthStoreAdmin.getState();
  if (url.startsWith('/owner') || url.startsWith('/carOwner') ||url.includes('/owner')||url.includes('/carOwner')) return useAuthStoreOwner.getState();
  return useAuthStore.getState(); 
};

const getRefreshEndpoint = (url: string) => {
  if (url.startsWith('/admin')||url.includes('/admin')) return '/admin/refreshToken';
  if (url.startsWith('/owner') || url.startsWith('/carOwner')) return '/owner/refreshToken';
  return '/refreshToken'; 
};


const getTokenFromStore = (store: any) => {
  if ('accessTokenAdmin' in store) return store.accessTokenAdmin;
  if ('accessTokenOwner' in store) return store.accessTokenOwner;
  return store.accessToken;
};


const setTokenToStore = (store: any, user: IUser | null, accessToken: string) => {
  if ('setAuthAdmin' in store) store.setAuthAdmin(user, accessToken);
  else if ('setAuthOwner' in store) store.setAuthOwner(user, accessToken);
  else if ('setAuth' in store) store.setAuth(user, accessToken);
};

// --- Axios Interceptors ---

// Request: attach token
instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const url = config.url || '';
  const store = getStoreByUrl(url);
  const token = getTokenFromStore(store);

  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Response: refresh token on 401/403
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const store = getStoreByUrl(originalRequest.url || '');

      if (!isRefreshing) {
        isRefreshing = true;

        refreshPromise = instance
          .post(getRefreshEndpoint(originalRequest.url || ''), {}, { withCredentials: true })
          .then((res) => {
            const newAccessToken = res.data.accessToken as string;
            setTokenToStore(store, store.user, newAccessToken);
            isRefreshing = false;
            return newAccessToken;
          })
          .catch((refreshError) => {
            console.error('Refresh token invalid', refreshError);

            // Logout all stores
            useAuthStore.getState().logout();
            useAuthStoreOwner.getState().logout();
            useAuthStoreAdmin.getState().logout();

            isRefreshing = false;
            if (typeof window !== 'undefined') window.location.href = '/login';
            return Promise.reject(refreshError);
          });
      }

      try {
        const newAccessToken = await refreshPromise!;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
