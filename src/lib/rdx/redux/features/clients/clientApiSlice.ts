import {

	ClientAdminData,
	ClientAdminResponseData,
	ClientsResponse,
	

} from "@/types";

import {
	Products,
	ClientProduct,
	LatestInvitation,
	SingleClient
} from "@/types/clients"

import { baseApiSlice } from "../api/baseApiSlice";

export const clientApiSlice = baseApiSlice.injectEndpoints({
	endpoints: (builder) => ({
		createClient: builder.mutation<ClientAdminResponseData, ClientAdminData>({
			query: (clientData) => ({
				url: "/clients/",
				method: "POST",
				body: clientData,
			}),
			invalidatesTags: ["Client"],
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
            providesTags: ["Client"]
		}),
		getProducts: builder.query<Products[], void>({
			query: () => '/products/',
			providesTags: ['Products'],
		}),
	
	}),
});

export const {
	useCreateClientMutation,
	useGetAllClientsQuery,
	useGetClientByIdQuery,
	useGetProductsQuery
} = clientApiSlice;
