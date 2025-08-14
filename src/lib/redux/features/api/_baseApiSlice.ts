import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


const backend_url = process.env.NEXT_PUBLIC_API_BASE_URL
export const baseApiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ baseUrl: `${backend_url}/api/v1/`, credentials: "include"}),
    endpoints: (builder) => ({})
})