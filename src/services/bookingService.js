import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const bookingApi = createApi({
  reducerPath: "bookingApi",
  baseQuery: fetchBaseQuery({
    credentials: "include",
    baseUrl: "https://backend.apnasmartgate.com/api",
  }),
  tagTypes: ["Booking", "CommunityPayment"],
  endpoints: (builder) => ({
    getBookings: builder.query({
      query: () => ({ url: "/bookings", method: "GET" }),
      providesTags: ["Booking"],
    }),
    updateBooking: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/bookings/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Booking"],
    }),
    getCommunityPayments: builder.query({
      query: () => ({ url: "/community/all", method: "GET" }),
      transformResponse: (res) => res.payments || [],
      providesTags: ["CommunityPayment"],
    }),
    verifyPayment: builder.mutation({
      query: (body) => ({
        url: "/community/confirm-payment",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CommunityPayment"],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useUpdateBookingMutation,
  useGetCommunityPaymentsQuery,
  useVerifyPaymentMutation,
} = bookingApi;
