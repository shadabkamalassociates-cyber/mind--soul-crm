import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const bookingApi = createApi({
  reducerPath: 'bookingApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: 'https://backend.apnasmartgate.com/api',
  }),
  tagTypes: ['Booking'],
  endpoints: (builder) => ({
    getBookings: builder.query({
      query: () => ({ url: '/bookings', method: 'GET' }),
      providesTags: ['Booking'],
    }),
    updateBooking: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/bookings/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Booking'],
    }),
  }),
})

export const {
  useGetBookingsQuery,
  useUpdateBookingMutation,
} = bookingApi
