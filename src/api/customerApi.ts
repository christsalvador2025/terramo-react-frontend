import { baseApi } from './baseApi';

interface Customer {

    id: number | string,
    name: string,
    base64Image: string,
    
}

interface CustomersResponse {
  response: Customer[];
}

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all customers
    getCustomers: builder.query<Customer[], void>({
      query: () => '/customers',
      transformResponse: (response: CustomersResponse) => response.response || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: 'Customer' as const,
                id: id,
              })),
              { type: 'Customer', id: 'LIST' },
            ]
          : [{ type: 'Customer', id: 'LIST' }],
    }),

    // Get single customer by id
    getCustomerById: builder.query<Customer, number>({
      query: (id) => `/customers/${id}`,
      transformResponse: (response: Customer) => {
        if (!response || !response.ID) {
          throw new Error('Customer not found');
        }
        return response;
      },
      providesTags: (_result, _error, id) => [{ type: 'Customer', id }],
    }),


    // Create new customer
    createCustomer: builder.mutation<Customer, Partial<Customer>>({
      query: (body) => ({
        url: '/customers',
        method: 'POST',
        body,
      }),
      transformResponse: (response: CustomersResponse) => response.response[0],
      invalidatesTags: [{ type: 'Person', id: 'LIST' }],
    }),

    // Update existing customer
    updateCustomer: builder.mutation<
      Customer,
      { id: number; updates: Partial<Customer> }
    >({
      query: ({ id, updates }) => ({
        url: `/customers/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      transformResponse: (response: CustomersResponse) => response.response[0],
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Customer', id }],
    }),

    // Delete Customer
    deleteCustomer: builder.mutation<void, number>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),
  }),
});

// Export all hooks
export const {
  useGetCustomersQuery,
  useLazyGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customerApi;