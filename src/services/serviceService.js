import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const serviceApi = createApi({
  reducerPath: 'serviceApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: '/api',
  }),
  tagTypes: ['Service'],
  endpoints: (builder) => ({
    getServices: builder.query({
      query: () => ({ url: '/services', method: 'GET' }),
      providesTags: ['Service'],
    }),
    getService: builder.query({
      query: (id) => ({ url: `/services/${id}`, method: 'GET' }),
      providesTags: (r, e, id) => [{ type: 'Service', id }],
    }),
    addService: builder.mutation({
      query: (body) => ({ url: '/services', method: 'POST', body }),
      invalidatesTags: ['Service'],
    }),
    updateService: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/services/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Service'],
    }),
    updateServiceStatus: builder.mutation({
      query: ({ id, status, reviewNote }) => ({ url: `/services/${id}/status`, method: 'PATCH', body: { status, reviewNote } }),
      invalidatesTags: ['Service'],
    }),
    updateServiceVideoStatus: builder.mutation({
      query: ({ id, videoStatus, videoReviewNote }) => ({ url: `/services/${id}/video-status`, method: 'PATCH', body: { videoStatus, videoReviewNote } }),
      invalidatesTags: ['Service'],
    }),
    deleteService: builder.mutation({
      query: (id) => ({ url: `/services/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Service'],
    }),
  }),
})

export const {
  useGetServicesQuery,
  useGetServiceQuery,
  useAddServiceMutation,
  useUpdateServiceMutation,
  useUpdateServiceStatusMutation,
  useUpdateServiceVideoStatusMutation,
  useDeleteServiceMutation,
} = serviceApi
