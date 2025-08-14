import { store } from '../app/store';
import { refreshToken } from '../api/authApi';

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const handleTokenRefresh = async (): Promise<string> => {
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }

  try {
    const result = await store.dispatch(
      refreshToken.initiate({ refresh: refreshTokenValue })
    ).unwrap();
    
    store.dispatch(setCredentials({
      token: result.access,
      refreshToken: refreshTokenValue, // Refresh token remains the same
    }));
    
    return result.access;
  } catch (error) {
    store.dispatch(clearCredentials());
    throw error;
  }
};

// Token refresh interval
setInterval(() => {
  if (isAuthenticated()) {
    handleTokenRefresh().catch(() => {
      // Silent failure - will retry on next API call
    });
  }
}, parseInt(import.meta.env.VITE_TOKEN_REFRESH_INTERVAL || '300000'));