import {
  ClientAdminResponseData,
  ClientsResponse,
} from "../../../types";
import {
  Products,
  SingleClient
} from "../../../_types/clients";
import { baseApiSlice } from "../api/baseApiSlice";
import { TRegisterClientAdminSchema } from "../../validations/_clientSchema";
import { TStakeholderRegistrationSchema, TEmailVerificationSchema, TProcessInvitationResponse, TStakeholderRegistrationResponse, TEmailVerificationResponse } from "../../../_types/stakeholders"; // 👈 Add new types here


interface AcceptInvitationResponse {
  success: boolean;
  message: string;
  action: 'login' | 'complete_registration' | 'redirect_to_login' | 'contact_support';
  email?: string;
  login_token?: string;
  user_id?: number;
  invitation_id?: number;
  status: 'already_registered' | 'newly_registered' | 'error';
}

interface AcceptInvitationRequest {
  email: string;
  token: string;
}
// Helper function to convert form data to FormData for file upload
const createFormData = (data: TRegisterClientAdminSchema): FormData => {
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
    createClient: builder.mutation<ClientAdminResponseData, TRegisterClientAdminSchema>({
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
    
    updateClient: builder.mutation<ClientAdminResponseData, { id: string; data: Partial<TRegisterClientAdminSchema> }>({
      query: ({ id, data }) => {
        const formData = createFormData(data as TRegisterClientAdminSchema);
        
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
    // ------------- client admin invitations ---------------------
    acceptInvitationByToken: builder.query<AcceptInvitationResponse, { token: string; email?: string }>({
      query: (token) => ({
        url: `/client-admin/accept-invitation/${token}`,
        method: "GET",
      }),
      providesTags: (result, error, token) => [{ type: "Invitation", id: token}],
    }),
    // POST method - for form-based invitation acceptance
    acceptInvitation: builder.mutation<AcceptInvitationResponse, AcceptInvitationRequest>({
      query: (invitationData) => ({
        url: "/accept-invitation/",
        method: "POST",
        body: invitationData,
      }),
      invalidatesTags: ["Invitation", "Client"],
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          data: response.data,
        };
      },
    }),
    // ------------- stakeholder invitations ---------------------
    
    // Query endpoint to process the stakeholder invitation token.
    // Matches Django URL: path('stakeholder/invite/<str:token>/', ProcessInvitationView.as_view())
    processStakeholderInvitation: builder.query<TProcessInvitationResponse, string>({
      query: (token) => ({
        url: `/authentication/stakeholder/invite/${token}/`,
        method: "GET",
      }),
      providesTags: (result, error, token) => [{ type: "StakeholderInvitation", id: token}],
    }),
    
    // Mutation endpoint to verify the stakeholder's email.
    // Matches Django URL: path('stakeholder/verify-email/', VerifyEmailView.as_view())
    verifyStakeholderEmail: builder.mutation<TEmailVerificationResponse, TEmailVerificationSchema>({
      query: (data) => ({
        url: "/authentication/stakeholder/verify-email/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["StakeholderInvitation"],
    }),
    
    // Mutation endpoint to complete the stakeholder's registration.
    // Matches Django URL: path('stakeholder/register/', StakeholderRegistrationView.as_view())
    registerStakeholder: builder.mutation<TStakeholderRegistrationResponse, TStakeholderRegistrationSchema>({
      query: (data) => ({
        url: "/authentication/stakeholder/register/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["StakeholderInvitation"],
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
  
  // 👈 Export new hooks for stakeholders
  useProcessStakeholderInvitationQuery,
  useLazyProcessStakeholderInvitationQuery, // Lazy query is useful for manual fetching.
  useVerifyStakeholderEmailMutation,
  useRegisterStakeholderMutation,
} = clientApiSlice;