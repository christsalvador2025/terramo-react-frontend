// src/api/clientApiSlice.ts
import { baseApiSlice } from "./baseApiSlice";

// Types - adjust these according to your actual type definitions
interface ClientAdminResponseData {
  id: number;
  email: string;
  company_name: string;
  first_name: string;
  last_name: string;
  // Add other fields as needed
}

interface ClientsResponse {
  results: ClientAdminResponseData[];
  count: number;
  next: string | null;
  previous: string | null;
}

interface Products {
  id: number;
  name: string;
  description?: string;
  // Add other product fields as needed
}

interface SingleClient {
  id: number;
  company_name: string;
  email: string;
  // Add other client fields as needed
}

interface RegisterClientAdminSchema {
  company_name: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company_photo?: File;
  product_ids?: number[];
  // Add other fields as needed
}

interface AcceptInvitationResponse {
  success?: boolean;
  message: string;
  message_stat: 'accepted_and_verified' | 'accepted_and_for_verification' | 'invitation_not_found' | 'email_verified';
  action?: 'login' | 'complete_registration' | 'redirect_to_login' | 'contact_support';
  email?: string;
  login_token?: string;
  user_id?: number;
  invitation_id?: number;
  status?: 'already_registered' | 'newly_registered' | 'error';
  redirect_url?: string | null;
  // JWT tokens (for successful login)
  access?: string;
  refresh?: string;
  user?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    last_login: string | null;
  };
}

interface AcceptInvitationRequest {
  email: string;
  token: string;
}

// Helper function to convert form data to FormData for file upload
const createFormData = (data: RegisterClientAdminSchema): FormData => {
  const formData = new FormData();
  
  // Add all text fields
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'company_photo') {
      // Handle file separately
      if (value instanceof File) {
        formData.append('company_photo', value);
      }
    } else if (key === 'product_ids') {
      // Handle array fields
      if (Array.isArray(value)) {
        value.forEach((id, index) => {
          formData.append(`product_ids[${index}]`, id);
        });
      }
    } else if (value !== undefined && value !== null) {
      // Handle other fields
      formData.append(key, String(value));
    }
  });
  
  return formData;
};

export const clientApiSlice = baseApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createClient: builder.mutation<ClientAdminResponseData, RegisterClientAdminSchema>({
      query: (clientData) => {
        const formData = createFormData(clientData);
        
        return {
          url: "/clients/",
          method: "POST",
          body: formData,
          // Don't set Content-Type header - let the browser set it with boundary for multipart
        };
      },
      invalidatesTags: ["Client"],
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          data: response.data,
        };
      },
    }),
    
    getAllClients: builder.query<ClientsResponse, void>({
      query: () => ({
        url: "/clients/",
        method: "GET",
      }),
      providesTags: ["Client"],
    }),
    
    getClientById: builder.query<SingleClient, string>({
      query: (id) => ({
        url: `/clients/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Client", id }],
    }),
    
    updateClient: builder.mutation<ClientAdminResponseData, { id: string; data: Partial<RegisterClientAdminSchema> }>({
      query: ({ id, data }) => {
        const formData = createFormData(data as RegisterClientAdminSchema);
        
        return {
          url: `/clients/${id}`,
          method: "PATCH",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: "Client", id }, "Client"],
    }),
    
    deleteClient: builder.mutation<void, string>({
      query: (id) => ({
        url: `/clients/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Client"],
    }),
    
    getProducts: builder.query<Products[], void>({
      query: () => "/products/",
      providesTags: ["Products"],
    }),
    
    // GET method - for initial token verification (when user clicks email link)
    acceptInvitationByToken: builder.query<AcceptInvitationResponse, { token: string; email?: string }>({
      query: ({ token }) => ({
        url: `/clients/client-admin/accept-invite/${token}/`,
        method: "GET",
      }),
      providesTags: (result, error, { token }) => [{ type: "Invitation", id: token }],
    }),
    
    // POST method - for email verification and final authentication
    acceptInvitation: builder.mutation<AcceptInvitationResponse, AcceptInvitationRequest>({
      query: ({ email, token }) => ({
        url: `/clients/client-admin/accept-invite/${token}/`,
        method: "POST",
        body: { email },
      }),
      invalidatesTags: ["Invitation", "Client"],
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          data: response.data,
        };
      },
    }),

    // GET method - for login via token from email
    loginByToken: builder.query<AcceptInvitationResponse, { token: string }>({
      query: ({ token }) => ({
        url: `/clients/client-admin/login-token/${token}/`,
        method: "GET",
      }),
      providesTags: (result, error, { token }) => [{ type: "LoginToken", id: token }],
    }),

    // POST method - request login link via email
    requestLoginLink: builder.mutation<
      { message: string; success: boolean }, 
      { email: string }>({
      query: ({ email }) => ({
        url: "/clients/client-admin/request-login/",
        method: "POST",
        body: { email },
      }),
      invalidatesTags: ["LoginRequest"],
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          data: response.data,
        };
      },
    }),
  }),
});

export const {
  useCreateClientMutation,
  useGetAllClientsQuery,
  useGetClientByIdQuery,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useGetProductsQuery,
  useAcceptInvitationByTokenQuery,
  useLazyAcceptInvitationByTokenQuery,
  useAcceptInvitationMutation,
  useLoginByTokenQuery,
  useLazyLoginByTokenQuery,
  useRequestLoginLinkMutation, 
} = clientApiSlice;