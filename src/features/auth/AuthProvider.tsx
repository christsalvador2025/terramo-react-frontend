import { useEffect } from 'react';
import { useValidateTokenQuery } from '../../api/authApi';
import { useAppDispatch } from '../../app/hooks';
import { setCredentials, clearCredentials } from './authSlice';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { data, error } = useValidateTokenQuery();

  useEffect(() => {
    if (error) {
      dispatch(clearCredentials());
    } else if (data?.valid) {
      // Re-set credentials from localStorage
      dispatch(setCredentials({
        token: localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
        refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
      }));
    }
  }, [data, error, dispatch]);

  return <>{children}</>;
}