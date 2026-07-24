import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
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
