import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Form-Data Login (required by FastAPI OAuth2PasswordRequestForm)
    login: builder.mutation<{ 
      access: string; 
      refresh: string 
    }, { 
      username: string; 
      password: string 
    }>({
      query: (credentials) => {
        const formData = new FormData();
        formData.append('email', credentials.email);
        formData.append('password', credentials.password);
        
        return {
          url: '/auth/login/',
          method: 'POST',
          body: formData,
        };
      },
    }),

    // Token Refresh
    refreshToken: builder.mutation<{ 
      access: string 
    }, { 
      refresh: string 
    }>({
      query: ({ refresh }) => ({
        url: '/auth/token/refresh',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
      }),
    }),

    // Token Validation
    validateToken: builder.query<{ 
      valid: boolean;
      user?: { 
        id: string;
        email: string;
      } 
    }, void>({
      query: () => ({
        url: '/auth/token/validate',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    // Logout
    logout: builder.mutation<any, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const state: any = _queryApi.getState();
        const token = state.auth.access_token;

        const result = await baseQuery({
          url: '/auth/token/logout',
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        return result;
      },
    }),

  }),
});

// Export hooks with descriptive names
export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useValidateTokenQuery,
  useLogoutMutation,
} = authApi;
