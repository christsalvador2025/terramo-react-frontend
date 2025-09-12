// RTK Query endpoints

import { apiSlice } from "../features/api/apiSlice";


interface ApiErrorResponse {
  error: string;
}
interface ClientQuestions {
  question_id: string;
  index_code: string;
  measure: string;
  question_description: string;
  priority: number | null;  // Allow null values
  status_quo: number | null;  // Allow null values
  comment: string;
  priority_display: string | null;
  status_quo_display: string | null;
  completion_score: number;
  status: string;
  response_id: string | null;
  response_count?: number; // For stakeholder aggregated data
}
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
interface ClientAdminDashboardYearParams {
  year?: string | number; // optional if not set
}

interface StakeholderGroup {
  id: string;
  name: string;
}

interface StakeholderAnalysisResponse {
  client: {
    id: string;
    name: string;
  };
  year: number;
  categories: Record<string, CategoryData>; // Client admin averages
  question_response: Record<string, CategoryResponseData>; // Client admin responses
  stakeholder_groups: StakeholderGroup[];
}
interface ClientAdminDashboardParams {
  client_id: string;
  year?: string | number; 
}


export const projectApi = apiSlice.injectEndpoints({

    // Project endpoints
    endpoints: (builder) => ({
    getClientAdminDashboard: builder.query<ClientAdminDashboardResponse, ClientAdminDashboardYearParams>({

      query: ({ year }) => {
        // Build query parameters
        const params = new URLSearchParams();
    
        if (year) {
          params.append('year', year.toString());
        }
        
        return {
          url: `/esg/dashboard/client-admin/?${params.toString()}`,
          method: "GET",
        };
      },
      keepUnusedDataFor:'',
      providesTags: ["ClientAdminDashboard"],
      transformErrorResponse: (response) => {
  
        return {
          status: response.status,
          data: response.data as ApiErrorResponse,
        };
      },
    }),

    getStakeholderAnalysisDashboard: builder.query<StakeholderAnalysisResponse, ClientAdminDashboardParams>({
      query: ({ year }) => {
        // Build query parameters
        const params = new URLSearchParams();
        
        if (year) {
          params.append('year', year.toString());
        }
        
        return {
          url: `/esg/dashboard/client-admin/stakeholders-analysis/?${params.toString()}`,
          method: "GET",
        };
      },
      keepUnusedDataFor:'',
      providesTags: ["StakeholderAnalysis", "ClientAdminDashboard"],
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          data: response.data as ApiErrorResponse,
        };
      },
    }),

        // provide the cache update
        fetchAllProjects: builder.query({
            query: () => ({
                url: "/projects",
                method: "GET",
            }),
            providesTags: ["Projects"],
        }),
        // invalidate cache
        addProject: builder.mutation({
            query: (data) => ({
                url: "/projects",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Projects","ProjectLists"],
        }),
        
        getProjectById: builder.query({
            query: (id) => ({
                url: `/projects/${id}`,
                method: "GET",
            }),
            providesTags: ["Projects"],
        }),
        updateProjectById: builder.mutation({
            query: ({data, id}) => ({
                url: `/projects/${id}`,
                method: "PATCH",
                body: data,
            }),
           
            invalidatesTags: ["Projects","ProjectProgress","ProjectLists"],
        }),
        fetchAllProjectByUserId: builder.query({
            query: (ownerId) => ({
                url: `/projects/projects-lists/${ownerId}`,
                method: "GET",
            }),
            providesTags: ["ProjectLists"],
            onError: (error) => {
                console.log('JWT token has expired');
                console.log('error',error);
                if (error.data?.error === 'TokenExpiredError') {
                  // Handle token expiration, e.g., by logging out the user
                  console.log('JWT token has expired');
                } else {
                  // Handle other errors
                  console.error('An error occurred:', error.message);
                }
                // localStorage.removeItem('userInfoData')
            },
        }),
        deleteProject: builder.mutation({
            query: (id) => ({
                url: `/projects/${id}`,
                method: "DELETE",
            
            }),
            invalidatesTags: ["Projects","ProjectLists"],
        }),
        getProjectRootById: builder.query({
            query: (id) => ({
                url: `/projectroot/project/${id}`,
                method: "GET",
            }),
            providesTags: ["ProjectRoot"],
        }),
        getProjectLvlOneById: builder.query({
            query: () => ({
                url: `/projectlevelone`,
                method: "GET",
            }),
            providesTags: ["ProjectOne"],
        }),
        getProjectLvlTwoById: builder.query({
            query: () => ({
                url: `/projectleveltwo`,
                method: "GET",
            }),
            providesTags: ["ProjectTwo"],
        }),
        getProjectLvlThreeById: builder.query({
            query: () => ({
                url: `/projectlevelthree`,
                method: "GET",
            }),
            providesTags: ["ProjectThree"],
        }),
        addData: builder.mutation({
            query: ({data, endpoint}) => ({
                url: `/${endpoint}`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["ProjectRoot","ProjectOne","ProjectTwo", "ProjectThree"],
        }),
        deleteData: builder.mutation({
            query: ({editDeleteLvl, itemId}) => ({
                url: `/${editDeleteLvl}/${itemId}`,
                method: "DELETE",
            }),
            // invalidatesTags: ["Projects"],
            invalidatesTags: ["ProjectRoot","ProjectOne","ProjectTwo", "ProjectThree"],
        }),
        updateData: builder.mutation({
            query: ({editDeleteLvl, itemId, data}) => ({
                url: `/${editDeleteLvl}/${itemId}`,
                method: "PATCH",
                body: data,
            }),
            // invalidatesTags: ["Projects"],
            invalidatesTags: ["ProjectRoot","ProjectOne","ProjectTwo", "ProjectThree"],
        }),
        // for update, add, delete info 
        addProjectInfo: builder.mutation({
            query: ({projectEndpoint, projectLevelId, data}) => ({
                url: `/${projectEndpoint}/add-info/${projectLevelId}`,
                method: "PUT",
                body: data,
            }),
            // Customize the response handler
            onMutate: async (data) => {
                const response = await fetch('/api/add-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                });
                const responseData = await response.json();
                return responseData; // This response will be accessible in the mutation result
            },
            invalidatesTags: ["ProjectRoot","ProjectOne","ProjectTwo", "ProjectThree"],
        }),
        deleteProjectInfo: builder.mutation({
            query: ({projectEndpoint, projectLevelId, infoID}) => ({
                url: `/${projectEndpoint}/remove-info/${projectLevelId}/${infoID}`,
                method: "PUT",
                // body: data,
            }),
            // Customize the response handler
            onMutate: async (data) => {
                const response = await fetch('/api/remove-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                });
                const responseData = await response.json();
                return responseData; // This response will be accessible in the mutation result
            },
            invalidatesTags: ["ProjectRoot","ProjectOne","ProjectTwo", "ProjectThree"],
        }),
        updateProjectInfo: builder.mutation({
            query: ({projectEndpoint, projectLevelId, data, infoID}) => ({
                url: `/${projectEndpoint}/update-info/${projectLevelId}/${infoID}`,
                method: "PUT",
                body: data,
            }),
            // Customize the response handler
            onMutate: async (data) => {
                const response = await fetch('/api/remove-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                });
                const responseData = await response.json();
                return responseData; // This response will be accessible in the mutation result
            },
            invalidatesTags: ["ProjectRoot","ProjectOne","ProjectTwo", "ProjectThree"],
        }),

        // deleting parent and children
        deleteParentChildrenData: builder.mutation({
            query: ({projectEndpoint, parentId}) => ({
                url: `/${projectEndpoint}/delete-children/${parentId}`,
                method: "DELETE",
            }),
            // invalidatesTags: ["Projects"],
            invalidatesTags: ["ProjectRoot","ProjectOne","ProjectTwo", "ProjectThree"],
        }),
        // provide the cache update
        fetchAllProjectProgressByUserId: builder.query({
            query: (ownerId) => ({
                url: `/projectprogress/progress/${ownerId}`,
                method: "GET",
            }),
            keepUnusedDataFor:'',
            providesTags: ["ProjectProgress"],
            
        }),
        // provide the cache update
        fetchAllProjectByWatcherId: builder.query({
            query: (watcherId) => ({
                url: `/projects/projects-lists/watchers/${watcherId}`,
                method: "GET",
            }),
        
            providesTags: ["ProjectProgress"],
            
        }),
        updateProjectProgress: builder.mutation({
            query: ({data, id}) => ({
                url: `/projectprogress/update-data/${id}`,
                method: "PUT",
                body: data,
            }),
           
            invalidatesTags: ["ProjectProgress","ProjectLists","Projects"],
        }),
        createProjectTemplate: builder.mutation({
            query: (data) => ({
                url: '/projects/create-template',
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["ProjectRoot","ProjectOne","ProjectTwo", "ProjectThree","ProjectProgress", "ProjectLists","Projects"],
        }),
        deleteProjectWatcher: builder.mutation({
            query: ({projectId, watcherId}) => ({
                url: `/projects/remove-watcher/${projectId}/${watcherId}`,
                method: "PUT",
                // body: data,
            }),
            // Customize the response handler
         
            invalidatesTags: ["Projects","ProjectRoot","ProjectOne","ProjectTwo", "ProjectThree","ProjectProgress","ProjectLists"],
        }),
        updateProjectWatcher: builder.mutation({
            query: ({ projectId, watcherId, data}) => ({
                url: `/projects/update-watcher/${projectId}/${watcherId}`,
                method: "PUT",
                body: data,
            }),
             
            invalidatesTags: ["Projects","ProjectRoot","ProjectOne","ProjectTwo", "ProjectThree","ProjectProgress","ProjectLists"],
        }),
        addProjectWatcher: builder.mutation({
            query: (data) => ({
                url: `/projects/add-watchers`,
                method: "PUT",
                body: data,
            }),
             
            invalidatesTags: ["ProjectRoot","ProjectOne","Projects","ProjectTwo", "ProjectThree", "ProjectProgress","ProjectLists"],
        }),
        
    })
});

export const { 
    useFetchAllProjectsQuery,
    useAddProjectMutation,
    useGetProjectByIdQuery,
    useGetProjectRootByIdQuery,
    useGetProjectLvlOneByIdQuery,
    useGetProjectLvlTwoByIdQuery,
    useGetProjectLvlThreeByIdQuery,
    useAddDataMutation,
    useDeleteDataMutation,
    useUpdateDataMutation,
    useAddProjectInfoMutation,
    useDeleteProjectInfoMutation,
    useUpdateProjectInfoMutation,
    useDeleteParentChildrenDataMutation,
    useFetchAllProjectProgressByUserIdQuery,
    useUpdateProjectProgressMutation,
    useCreateProjectTemplateMutation,
    useFetchAllProjectByUserIdQuery,
    useUpdateProjectByIdMutation,
    useDeleteProjectMutation,
    useDeleteProjectWatcherMutation,
    useUpdateProjectWatcherMutation,
    useAddProjectWatcherMutation,
    useFetchAllProjectByWatcherIdQuery,

    useGetClientAdminDashboardQuery,
    useGetStakeholderAnalysisDashboardQuery,
    
} = projectApi;