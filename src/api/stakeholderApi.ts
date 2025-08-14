import { baseApi } from './baseApi';

interface Stakeholder {
  STAKEHOLDER_ID: number;
  STAKEHOLDER_PARENT_ID: number | null;
  STAKEHOLDER_NACE: string | null;
  STAKEHOLDER_CREATED: string;
  STAKEHOLDER_UPDATED: string | null;
  STAKEHOLDER_CREATED_BY: number;
  STAKEHOLDER_UPDATED_BY: number | null;
}

interface StakeholdersResponse {
  response: Stakeholder[];
}

export const stakeholderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all stakeholders
    getStakeholders: builder.query<Stakeholder[], void>({
      query: () => '/stakeholder',
      transformResponse: (response: StakeholdersResponse) => response.response || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ STAKEHOLDER_ID }) => ({
                type: 'Stakeholder' as const,
                id: STAKEHOLDER_ID,
              })),
              { type: 'Stakeholder', id: 'LIST' },
            ]
          : [{ type: 'Stakeholder', id: 'LIST' }],
    }),

    // Get single stakeholder (returns single object)
    getStakeholderById: builder.query<Stakeholder, number>({
      query: (id) => `/stakeholder/${id}`,
      transformResponse: (response: Stakeholder) => {
        if (!response || !response.STAKEHOLDER_ID) {
          throw new Error('Stakeholder not found');
        }
        return response;
      },
      providesTags: (_result, _error, id) => [{ type: 'Stakeholder', id }],
    }),


    // Create new stakeholder
    createStakeholder: builder.mutation<Stakeholder, Partial<Stakeholder>>({
      query: (body) => ({
        url: '/stakeholder',
        method: 'POST',
        body,
      }),
      transformResponse: (response: StakeholdersResponse) => response.response[0],
      invalidatesTags: [{ type: 'Stakeholder', id: 'LIST' }],
    }),

    // Update existing stakeholder
    updateStakeholder: builder.mutation<
      Stakeholder,
      { id: number; updates: Partial<Stakeholder> }
    >({
      query: ({ id, updates }) => ({
        url: `/stakeholder/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      transformResponse: (response: StakeholdersResponse) => response.response[0],
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Stakeholder', id }],
    }),

    // Delete stakeholder
    deleteStakeholder: builder.mutation<void, number>({
      query: (id) => ({
        url: `/stakeholder/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Stakeholder', id },
        { type: 'Stakeholder', id: 'LIST' },
      ],
    }),
  }),
});

// Export all hooks
export const {
  useGetStakeholdersQuery,
  useLazyGetStakeholdersQuery,
  useGetStakeholderByIdQuery,
  useCreateStakeholderMutation,
  useUpdateStakeholderMutation,
  useDeleteStakeholderMutation,
} = stakeholderApi;