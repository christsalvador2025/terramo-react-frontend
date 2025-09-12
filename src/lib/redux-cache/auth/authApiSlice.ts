// import { baseApiSlice } from "../features/api/apiSlice";
import { rootApi } from "../app/rootApi";
import { 
    RegisterClientData, 
    RegisterClientDataResponse,
    LoginAdminData,
    LoginTerramoAdminResponse 
} from "../../../types/index";

interface LoginLinkResponse {
  message: string;
  success: boolean;
  status: string;
}
interface LoginLinkRequest {
  email: string;
}
interface TokenLoginRequest {
  token: string;
}

interface TokenLoginResponse {
  message: string;
  message_stat: string;
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    last_login: string | null;
  };
  client: {
    id: number;
    company_name: string;
    email: string;
  };
}


/** -------------------------------------------------------------------------------------
 *  STAKEHOLDER TYPES START
 * --------------------------------------------------------------------------------------
 */
interface StakeholderLoginLinkResponse {
  message: string;
  success: boolean;
  status: string;
}

interface StakeholderLoginLinkRequest {
  email: string;
}

interface StakeholderTokenLoginRequest {
  token: string;
}

interface StakeholderTokenLoginResponse {
  message: string;
  success: boolean;
  status: string;
  stakeholder: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    group_name: string;
    group_id: string;
  };

}
/** -------------------------------------------------------------------------------------
 *  STAKEHOLDER TYPES END
 * --------------------------------------------------------------------------------------
 */
// mutation: (return data, sent to the server)
export const authApiSlice = rootApi.injectEndpoints({
    endpoints: (builder)=>({
        
        registerClient: builder.mutation<RegisterClientDataResponse,RegisterClientData>({
            query: (clientData) => ({
                url: "/clients/",
                method: "POST",
                body: clientData,
            })
        }),
        loginUser: builder.mutation<LoginTerramoAdminResponse ,LoginAdminData>({
            query: (credentials) => ({
                url: "/authentication/admin/login/",
                method: "POST",
                body: credentials,
            })
        }),
        logoutUser: builder.mutation<void,void>({
            query: () => ({
                url: "/auth/logout/",
                method: "POST"
     
            })
        }),
        refreshJWT: builder.mutation<void,void>({
            query: () => ({
                url: "/auth/token/refresh/",
                method: "POST"
     
            })
        }),
        getCurrentClientAdmin: builder.mutation<void,void>({
            query: () => ({
                url: "/clients/",
                method: "POST"
     
            })
        }),
        // client admin authentication
        requestClientAdminLoginLink: builder.mutation<LoginLinkResponse, LoginLinkRequest>({
            query: (data) => ({
                url: '/clients/client-admin/request-login/',
                method: 'POST',
                body: data,
            }),
        }),
        clientAdminTokenLogin: builder.mutation<TokenLoginResponse, TokenLoginRequest>({
            query: ({ token }) => ({
                url: `/clients/client-admin/login/${token}/`,
                method: 'POST',
            }),
        }),

        // STAKEHOLDERS
        // Stakeholder authentication endpoints
        requestStakeholderLoginLink: builder.mutation<StakeholderLoginLinkResponse, StakeholderLoginLinkRequest>({
            query: (data) => ({
                url: '/authentication/stakeholder/request-login/',
                method: 'POST',
                body: data,
            }),
        }),
        stakeholderTokenLogin: builder.mutation<StakeholderTokenLoginResponse, StakeholderTokenLoginRequest>({
            query: ({ token }) => ({
                url: `/authentication/stakeholder/login-user/${token}/`,
                method: 'POST',
            }),
        }),
    })
});

export const { 
    useRegisterClientMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useRefreshJWTMutation,
    useRequestClientAdminLoginLinkMutation,
    useClientAdminTokenLoginMutation,
    // Stakeholders
    useRequestStakeholderLoginLinkMutation,
    useStakeholderTokenLoginMutation,
} = authApiSlice;