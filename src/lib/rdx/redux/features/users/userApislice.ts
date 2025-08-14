import { baseApiSlice } from "@/lib/redux/features/api/baseApiSlice";
import { 
    RegisterClientData, 
    RegisterClientDataResponse,
    LoginAdminData,
    LoginTerramoAdminResponse, 
    QueryParams
} from "@/types";

export const clientsApiSlice = baseApiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getAllClients: builder.query<RegisterClientDataResponse, QueryParams>({
			query: (params = {}) => {
				const queryString = new URLSearchParams();

				if (params.page) {
					queryString.append("page", params.page.toString());
				}
				if (params.searchTerm) {
					queryString.append("search", params.searchTerm);
				}
				return `/clients/?${queryString.toString()}`;
			},
			providesTags: ["Client"],
		}),
		// getUserProfile: builder.query<ProfileResponse, void>({
		// 	query: () => "/profiles/user/my-profile/",
		// 	providesTags: ["User"],
		// }),
		// updateUserProfile: builder.mutation<ProfileData, ProfileData>({
		// 	query: (formData) => ({
		// 		url: "/profiles/user/update/",
		// 		method: "PATCH",
		// 		body: formData,
		// 	}),
		// 	invalidatesTags: ["User"],
		// }),
	}),
});

export const {
	useGetAllClientsQuery,
	// useGetUserProfileQuery,
	// useUpdateUserProfileMutation,
	// useGetAllTechniciansQuery,
} = clientsApiSlice;
