// src/api/organisationApi.ts
import { baseApi } from './baseApi';

export const organisationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganisations: builder.query<Organisation[], void>({
      query: () => ({
        url: '/organisation',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }),
      providesTags: ['Organisation']
    }),
    createOrganisation: builder.mutation<Organisation, Partial<Organisation>>({
      query: (body) => ({
        url: '/organisation',
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }),
      invalidatesTags: ['Organisation']
    }),
    // Add other CRUD operations
  }),
});