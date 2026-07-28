import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: '/api',
  }),
  tagTypes: ['Settings'],
  endpoints: (builder) => ({
    getSettings: builder.query({
      query: () => ({ url: '/settings', method: 'GET' }),
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation({
      query: (body) => ({ url: '/settings', method: 'PATCH', body }),
      invalidatesTags: ['Settings'],
    }),
  }),
})

export const {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} = settingsApi
