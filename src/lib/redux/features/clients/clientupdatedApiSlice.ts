

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

// Define a type for a single ESG question based on the API response
interface EsgQuestion {
  id: string;
  category: string;
  category_name: string;
  measure: string;
  index_code: string;
  order: number;
  is_active: boolean;
  year: string;
}

// The response type is now just an array of questions, as there's no pagination
type EsgQuestionsResponse = EsgQuestion[];

// Types for question averages
interface QuestionAverage {
  question_id: string;
  index_code: string;
  measure: string;
  avg_priority: number;
  avg_status_quo: number;
  response_count: number;
  total_possible_responses: number;
  response_rate: number;
}

interface CategoryAverageData {
  category_info: {
    id: string;
    name: string;
    display_name: string;
  };
  questions: QuestionAverage[];
}

interface QuestionAveragesData {
  question_averages: Record<string, QuestionAverage>;
  by_category: Record<string, CategoryAverageData>;
  total_users: number;
  calculation_timestamp: string;
}

interface QuestionAveragesResponse {
  client: {
    id: string;
    name: string;
  };
  year: number;
  category_filter?: string;
  averages: QuestionAveragesData;
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

/* -------------- FOR CLIENT ADMIIIN ESG RESPONSE START ----------------*/
interface Question {
  question_id: string;
  index_code: string;
  measure: string;
  avg_priority: number;
  avg_status_quo: number;
  response_count: number;
}


interface CategoryData {
  category_info: {
    id: string;
    name: string;
    display_name: string;
  };
  questions: Question[];
}
// interface ClientQuestions{
//   question_id: string;
//   index_code: string;
//   measure: string;
//   question_description: string;
//   priority: number;
//   status_quo: number;
//   comment: string;
//   priority_display: string;
//   status_quo_display: string;
//   is_answered: boolean;
//   completion_score: number;
//   status: string;
//   response_id: string;
// }
// new update ---------------------- start
interface ClientQuestions {
  question_id: string;
  index_code: string;
  measure: string;
  question_description: string;
  priority: number;
  status_quo: number;
  comment: string;
  priority_display: string;
  status_quo_display: string;
  is_answered: boolean;
  completion_score: number;
  status: string;
  response_id: string | null;
}
interface CategoryResponseData {
  category_info: {
    id: string;
    name: string;
    display_name: string;
  };
  questions: ClientQuestions[];
}
interface ClientAdminDashboardResponse {
  client: {
    id: string;
    name: string;
  };
  year: number;
  categories: Record<string, CategoryData>; // for averages
  question_response: Record<string, CategoryResponseData>; // user responses
}

// Interface for bulk update request
// interface BulkUpdateRequest {
//   responses: Array<{
//     question_id: string;
//     priority: number;
//     status_quo: number;
//     comment: string;
//   }>;
// }
export interface BulkUpdateRequest {
  status: 'draft' | 'submitted';
  responses: Array<{
    question_id: string;
    priority: number | null;     // allow null
    status_quo: number | null;   // allow null
    comment: string;
  }>;
}


interface BulkUpdateResponse {
  message: string;
  success?: boolean;
}

// new update -------------------------- end
interface ClientAdminQResponseData{
  question_response: {
    id: string;
    name: string;
    display_name: string;
  };
  questions: Question[];
}

// interface ClientAdminDashboardResponse {
//   client: {
//     id: string;
//     name: string;
//   };
//   year: number;
//   categories: Record<string, CategoryData>;
//   question_response: Record<string, ClientQuestions>; 
// }

// Error response type
interface ApiErrorResponse {
  error: string;
}
interface StakeholderData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  group: {
    id: string;
    name: string;
  };
  is_registered: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  last_login: string | null;
}

interface CreateStakeholderRequest {
  email: string;
  first_name?: string;
  last_name?: string;
  send_invitation?: boolean;
  send_login_link?: boolean;
}

interface CreateStakeholderResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  message?: string;
}

interface StakeholdersListResponse {
  results: StakeholderData[];
  count: number;
}

/* -------------- FOR CLIENT ADMIIIN ESG RESPONSE END ----------------*/
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

    // Original endpoint to get all ESG questions
    getAllEsgQuestions: builder.query<EsgQuestionsResponse, void>({
        query: () => "/esg/questions/",
        providesTags: ["ESGQuestion"],
    }),
    getClientQuestionAverages: builder.query<QuestionAveragesResponse, string>({
      query: (clientId) => ({
        url: `/esg/dashboard/question-averages/?client_id=${clientId}`,
        method: "GET",
      }),
      providesTags: (result, error, clientId) => [
        { type: "ESGQuestionAverages", id: clientId },
      ],
    }),
     
    getClientAdminDashboard: builder.query<ClientAdminDashboardResponse, void>({
      query: () => ({
        url: "/esg/dashboard/client-admin/",
        method: "GET",
      }),
      providesTags: ["ClientAdminDashboard"],
      transformErrorResponse: (response) => {
        console.log("response->>>>", response)
        return {
          status: response.status,
          data: response.data as ApiErrorResponse,
        };
      },
    }),
    
   
    // bulkUpdateEsgResponses: builder.mutation<BulkUpdateResponse, BulkUpdateRequest>({
    //   query: (data) => ({
    //     url: "/esg/dashboard/bulk-update-responses/",
    //     method: "POST",
    //     body: data,
    //   }),
    //   invalidatesTags: ["ClientAdminDashboard"],
    //   transformErrorResponse: (response) => {
    //     return {
    //       status: response.status,
    //       data: response.data,
    //     };
    //   },
    // }),
    bulkUpdateEsgResponses: builder.mutation<BulkUpdateResponse, BulkUpdateRequest>({
      // 
      query: (data) => ({
        url: "/esg/dashboard/bulk-update/",    
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ClientAdminDashboard"],
      transformErrorResponse: (response) => ({
        status: (response as any).status,
        data: (response as any).data,
      }),
    }),

    // stakeholders
    createStakeholder: builder.mutation<CreateStakeholderResponse, { groupId: string; data: CreateStakeholderRequest }>({
      query: ({ groupId, data }) => ({
        url: `/authentication/groups/${groupId}/stakeholders/create/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { groupId }) => [
        { type: "Stakeholder", id: groupId },
        "Stakeholder"
      ],
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          data: response.data,
        };
      },
    }),

    // Remove a stakeholder
    removeStakeholder: builder.mutation<void, { stakeholderId: string; groupId: string }>({
      query: ({ stakeholderId }) => ({
        url: `/authentication/stakeholders/${stakeholderId}/remove/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { groupId }) => [
        { type: "Stakeholder", id: groupId },
        "Stakeholder"
      ],
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          data: response.data,
        };
      },
    }),

    // Get current user's stakeholder groups
    getCurrentUserStakeholderGroups: builder.query<{ results: Array<{ id: string; name: string; }> }, void>({
      query: () => ({
        url: "/authentication/stakeholder-groups/",
        method: "GET",
      }),
      providesTags: ["StakeholderGroup"],
    }),
    getStakeholdersByGroup: builder.query<StakeholdersListResponse, string>({
      query: (groupId) => ({
        url: `/authentication/groups/${groupId}/stakeholders/`,
        method: "GET",
      }),
      providesTags: (result, error, groupId) => [
        { type: "Stakeholder", id: groupId },
        "Stakeholder"
      ],
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
  useGetAllEsgQuestionsQuery,
  useGetClientQuestionAveragesQuery,

  // for client admin currently login
  useGetClientAdminDashboardQuery ,
  useBulkUpdateEsgResponsesMutation,

  // stakeholders
  useGetStakeholdersByGroupQuery,
  useCreateStakeholderMutation,
  useRemoveStakeholderMutation,
  useGetCurrentUserStakeholderGroupsQuery,
} = clientApiSlice;


