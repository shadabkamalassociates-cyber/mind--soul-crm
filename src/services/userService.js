import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: 'https://backend.apnasmartgate.com/api',
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => ({ url: '/users/fetch-all', method: 'GET' }),
      transformResponse: (response) => {
        const list = response?.success && Array.isArray(response.data) 
          ? response.data 
          : (Array.isArray(response) ? response : (response?.data && Array.isArray(response.data) ? response.data : []))
        return list.map((u) => {
          const firstName = u.first_name || ''
          const lastName = u.last_name || ''
          const fullName = `${firstName} ${lastName}`.trim() || u.email?.split('@')[0] || 'User'
          return {
            ...u,
            id: u.id,
            name: fullName,
            avatar: u.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1e293b&color=fff`,
            role: (u.role || 'user').toLowerCase(),
          }
        })
      },
      providesTags: ['User'],
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/users/${id}`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/users/update/${id}`,
        method: 'PUT',
        body: body.formData || body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    createUser: builder.mutation({
      query: (body) => ({
        url: '/users/create',
        method: 'POST',
        body: body.formData || body,
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useGetUsersQuery,
  useUpdateUserStatusMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useCreateUserMutation,
} = userApi

