import { baseApi } from './baseApi';

interface Person {

    PERSON_ID: number | string,
    STAKEHOLDER_ID: number | string,
    PERSON_SALUTATION: string,
    PERSON_FIRSTNAME: string | null,
    PERSON_LASTNAME: string | null,
    PERSON_GENDER: string | null,
    PERSON_PHONE: string | null,
    PERSON_MOBILE: string | null,
    PERSON_MAIL: string | null,
    PERSON_BIRTHDAY: number | null,
    PERSON_STREET: string | null,
    PERSON_ZIP: string | null,
    PERSON_STATE: string | null,
    PERSON_CITY: string | null,
    PERSON_COUNTRY_ISO: string | null,
    PERSON_CUSTOMER_FLAG: number | null,
    PERSON_COMMENTS: string | null,
    PERSON_CREATED: string | null,
    PERSON_UPDATED: string | null,
    PERSON_CREATED_BY: number | null,
    PERSON_UPDATED_BY: string | null
}

interface PersonsResponse {
  response: Person[];
}

export const personApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all persons
    getPersons: builder.query<Person[], void>({
      query: () => '/persons',
      transformResponse: (response: PersonsResponse) => response.response || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ PERSON_ID }) => ({
                type: 'Person' as const,
                id: PERSON_ID,
              })),
              { type: 'Person', id: 'LIST' },
            ]
          : [{ type: 'Person', id: 'LIST' }],
    }),

    // Get single persons (returns single object)
    getPersonById: builder.query<Person, number>({
      query: (id) => `/persons/${id}`,
      transformResponse: (response: Person) => {
        if (!response || !response.PERSON_ID) {
          throw new Error('Person not found');
        }
        return response;
      },
      providesTags: (_result, _error, id) => [{ type: 'Person', id }],
    }),


    // Create new persons
    createPerson: builder.mutation<Person, Partial<Person>>({
      query: (body) => ({
        url: '/persons',
        method: 'POST',
        body,
      }),
      transformResponse: (response: PersonsResponse) => response.response[0],
      invalidatesTags: [{ type: 'Person', id: 'LIST' }],
    }),

    // Update existing person
    updatePerson: builder.mutation<
      Person,
      { id: number; updates: Partial<Person> }
    >({
      query: ({ id, updates }) => ({
        url: `/persons/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      transformResponse: (response: PersonsResponse) => response.response[0],
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Person', id }],
    }),

    // Delete Person
    deletePerson: builder.mutation<void, number>({
      query: (id) => ({
        url: `/persons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Person', id },
        { type: 'Person', id: 'LIST' },
      ],
    }),
  }),
});

// Export all hooks
export const {
  useGetPersonsQuery,
  useLazyGetPersonsQuery,
  useGetPersonByIdQuery,
  useCreatePersonMutation,
  useUpdatePersonMutation,
  useDeletePersonMutation,
} = personApi;