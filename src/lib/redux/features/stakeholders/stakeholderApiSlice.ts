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

// Types for ESG Check
interface ESGQuestionResponse {
  question_id: string;
  priority: number | null;
  status_quo: number | null;
  comment: string | null;
}

interface StakeholderDashboardResponse {
  client: {
    id: string;
    name: string;
  };
  stakeholder: {
    id: string;
    name: string;
    email: string;
    group: string;
  };
  year: number;
  question_response: {
    [key: string]: {
      category_info: {
        id: string;
        name: string;
        display_name: string;
      };
      questions: Array<{
        question_id: string;
        index_code: string;
        measure: string;
        question_description: string;
        priority: number | null;
        status_quo: number | null;
        comment: string | null;
        priority_display: string | null;
        status_quo_display: string | null;
        is_answered: boolean;
        completion_score: number;
        status: string;
        response_id: string;
      }>;
    };
  };
}

interface BulkUpdateResponsesRequest {
  status: "draft" | "submitted";
  responses: ESGQuestionResponse[];
}

interface BulkUpdateResponsesResponse {
  message: string;
  updated: number;
  created: number;
  status: "draft" | "submitted";
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

    // Fetch stakeholder dashboard data
    getStakeholderDashboard: builder.query<StakeholderDashboardResponse, void>({
      query: () => ({
        url: '/esg/dashboard/stakeholder/',
        method: 'GET',
      }),
    }),

    // Bulk update ESG responses
    bulkUpdateStakeholderResponses: builder.mutation<BulkUpdateResponsesResponse, BulkUpdateResponsesRequest>({
      query: (data) => ({
        url: '/esg/dashboard/bulk-update/',
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
  useGetStakeholderDashboardQuery,
  useBulkUpdateStakeholderResponsesMutation,
} = stakeholderApiSlice;