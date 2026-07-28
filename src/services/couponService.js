import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const couponApi = createApi({
  reducerPath: 'couponApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: '/api',
  }),
  tagTypes: ['Coupon'],
  endpoints: (builder) => ({
    getCoupons: builder.query({
      query: () => ({ url: '/coupons', method: 'GET' }),
      providesTags: ['Coupon'],
    }),
    addCoupon: builder.mutation({
      query: (body) => ({ url: '/coupons', method: 'POST', body }),
      invalidatesTags: ['Coupon'],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/coupons/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Coupon'],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({ url: `/coupons/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Coupon'],
    }),
  }),
})

export const {
  useGetCouponsQuery,
  useAddCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponApi
