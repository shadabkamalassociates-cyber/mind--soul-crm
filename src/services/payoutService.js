import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const payoutApi = createApi({
  reducerPath: 'payoutApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: '/api',
  }),
  tagTypes: ['Payout'],
  endpoints: (builder) => ({
    getPayouts: builder.query({
      query: () => ({ url: '/payouts', method: 'GET' }),
      providesTags: ['Payout'],
    }),
    requestPayout: builder.mutation({
      query: (body) => ({ url: '/payouts', method: 'POST', body }),
      invalidatesTags: ['Payout'],
    }),
    updatePayoutStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/payouts/${id}`, method: 'PATCH', body: { status, paidOn: new Date().toISOString().slice(0, 10) } }),
      invalidatesTags: ['Payout'],
    }),
  }),
})

export const {
  useGetPayoutsQuery,
  useRequestPayoutMutation,
  useUpdatePayoutStatusMutation,
} = payoutApi
