// // store/api/clientApi.ts
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import { ClientAdminData, ClientAdminResponseData, Product } from '@/lib/types/client.types';

// export const clientApi = createApi({
//   reducerPath: 'clientApi',
//   baseQuery: fetchBaseQuery({
//     baseUrl: '/api',
//     prepareHeaders: (headers, { getState }) => {
//       // Add auth token if available
//       const token = (getState() as any).auth?.token;
//       if (token) {
//         headers.set('authorization', `Bearer ${token}`);
//       }
//       return headers;
//     },
//   }),
//   tagTypes: ['Client', 'Product'],
//   endpoints: (builder) => ({
//     createClient: builder.mutation<ClientAdminResponseData, ClientAdminData>({
//       query: (clientData) => ({
//         url: '/clients/',
//         method: 'POST',
//         body: clientData,
//       }),
//       invalidatesTags: ['Client'],
//       transformErrorResponse: (response: any) => {
//         return {
//           status: response.status,
//           data: response.data,
//         };
//       },
//     }),
    
//     getProducts: builder.query<Product[], void>({
//       query: () => '/products/',
//       providesTags: ['Product'],
//     }),
    
//     getClients: builder.query<ClientAdminResponseData[], void>({
//       query: () => '/clients/',
//       providesTags: ['Client'],
//     }),
    
//     getClientById: builder.query<ClientAdminResponseData, string>({
//       query: (id) => `/clients/${id}/`,
//       providesTags: (result, error, id) => [{ type: 'Client', id }],
//     }),
//   }),
// });

// export const {
//   useCreateClientMutation,
//   useGetProductsQuery,
//   useGetClientsQuery,
//   useGetClientByIdQuery,
// } = clientApi;