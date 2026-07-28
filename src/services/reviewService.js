import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: '/api',
  }),
  tagTypes: ['Review'],
  endpoints: (builder) => ({
    getReviews: builder.query({
      query: () => ({ url: '/reviews', method: 'GET' }),
      providesTags: ['Review'],
    }),
    updateReviewStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/reviews/${id}`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Review'],
    }),
  }),
})

export const {
  useGetReviewsQuery,
  useUpdateReviewStatusMutation,
} = reviewApi
