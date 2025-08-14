import { baseApiSlice } from "../api/baseApiSlice";

// Types for stakeholder invitation flow
interface ValidateInvitationRequest {
  token: string;
}

interface ValidateInvitationResponse {
  type: string;
  group_id: string;
  group_name: string;
  company_name: string;
  requires_email: boolean;
  token: string;
}

interface SubmitEmailRequest {
  email: string;
  token: string;
}

interface SubmitEmailResponse {
  action: string;
  message: string;
  email?: string;
  token?: string;
  stakeholder_id?: string;
  redirect_url?: string;
}

interface StakeholderRegistrationRequest {
  email: string;
  first_name: string;
  last_name: string;
  token: string;
}

interface StakeholderRegistrationResponse {
  message: string;
  stakeholder_id: string;
  status: string;
  email: string;
  redirect_url: string;
}

// Stakeholder API slice
export const stakeholderApiSlice = baseApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // Validate invitation token
    validateStakeholderInvitation: builder.mutation<ValidateInvitationResponse, ValidateInvitationRequest>({
      query: (data) => ({
        url: '/authentication/stakeholder/validate-invitation/',
        method: 'POST',
        body: data,
      }),
    }),

    // Submit email for invitation
    submitStakeholderEmail: builder.mutation<SubmitEmailResponse, SubmitEmailRequest>({
      query: (data) => ({
        url: '/authentication/stakeholder/submit-email/',
        method: 'POST',
        body: data,
      }),
    }),

    // Register stakeholder
    registerStakeholder: builder.mutation<StakeholderRegistrationResponse, StakeholderRegistrationRequest>({
      query: (data) => ({
        url: '/authentication/stakeholder/register-user/',
        method: 'POST',
        body: data,
      }),
    }),

  }),
});

export const {
  useValidateStakeholderInvitationMutation,
  useSubmitStakeholderEmailMutation,
  useRegisterStakeholderMutation,
} = stakeholderApiSlice;