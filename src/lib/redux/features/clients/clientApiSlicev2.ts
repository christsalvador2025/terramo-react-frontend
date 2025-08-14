// import { baseApiSlice } from "@/lib/redux/features/api/baseApiSlice";
// import { Client } from "@/types/client";
import { Client } from "@/components/client/dashboard/types/client"
import { Measure } from "@/components/client/dashboard/types/measure"

interface ClientMeasureGradingsResponse {
  measureGradings: any[];
}

interface ClientStakeholderMeasureGradingsResponse {
  stakeholderMeasureGradings: any[];
}

interface StakeholderResponse {
  id: number;
  label: string;
}

interface MeasureResponse extends Measure {
  // Add any additional fields if needed
}

export const clientApiSlice = baseApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get client by ID with full ESG data
    getClientById: builder.query<Client, string>({
      query: (id) => ({
        url: `/clients/${id}/`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Client", id }],
    }),

    // Get client measure gradings
    getClientMeasureGradings: builder.query<ClientMeasureGradingsResponse, string>({
      query: (clientId) => ({
        url: `/clients/${clientId}/measure-gradings/`,
        method: "GET",
      }),
      providesTags: (result, error, clientId) => [
        { type: "ClientMeasureGradings", id: clientId }
      ],
    }),

    // Get client stakeholder measure gradings
    getClientStakeholderMeasureGradings: builder.query<ClientStakeholderMeasureGradingsResponse, string>({
      query: (clientId) => ({
        url: `/clients/${clientId}/stakeholder-measure-gradings/`,
        method: "GET",
      }),
      providesTags: (result, error, clientId) => [
        { type: "ClientStakeholderMeasureGradings", id: clientId }
      ],
    }),

    // Get all measures
    getMeasures: builder.query<MeasureResponse[], void>({
      query: () => ({
        url: "/measures/",
        method: "GET",
      }),
      providesTags: ["Measures"],
    }),

    // Get all stakeholders
    getStakeholders: builder.query<StakeholderResponse[], void>({
      query: () => ({
        url: "/stakeholders/",
        method: "GET",
      }),
      providesTags: ["Stakeholders"],
    }),

    // Update client measure gradings
    updateClientMeasureGradings: builder.mutation<
      ClientMeasureGradingsResponse,
      { clientId: string; measureGradings: any[] }
    >({
      query: ({ clientId, measureGradings }) => ({
        url: `/clients/${clientId}/measure-gradings/`,
        method: "PUT",
        body: { measureGradings },
      }),
      invalidatesTags: (result, error, { clientId }) => [
        { type: "Client", id: clientId },
        { type: "ClientMeasureGradings", id: clientId },
      ],
    }),

    // Update client stakeholder selections
    updateClientStakeholderSelections: builder.mutation<
      any,
      { clientId: string; stakeholderSelections: any[] }
    >({
      query: ({ clientId, stakeholderSelections }) => ({
        url: `/clients/${clientId}/stakeholder-selections/`,
        method: "PUT",
        body: { stakeholderSelections },
      }),
      invalidatesTags: (result, error, { clientId }) => [
        { type: "Client", id: clientId },
        { type: "ClientStakeholderMeasureGradings", id: clientId },
      ],
    }),
  }),
});

export const {
  useGetClientByIdQuery,
  useGetClientMeasureGradingsQuery,
  useGetClientStakeholderMeasureGradingsQuery,
  useGetMeasuresQuery,
  useGetStakeholdersQuery,
  useUpdateClientMeasureGradingsMutation,
  useUpdateClientStakeholderSelectionsMutation,
} = clientApiSlice;