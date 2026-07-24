import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://backend.apnasmartgate.com/api',
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => ({ url: '/users', method: 'GET' }),
      providesTags: ['User'],
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/users/${id}`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useGetUsersQuery,
  useUpdateUserStatusMutation,
} = userApi
