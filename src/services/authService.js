import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: '/api',
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    adminLogin: builder.mutation({
      query: (body) => ({
        url: '/admin/logIn',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useAdminLoginMutation,
  useLoginMutation,
} = authApi
