import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
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
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => '/categories/fetch-all',
      transformResponse: (response) => {
        if (response?.success && Array.isArray(response.data)) {
          return response.data.map((cat) => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon || '',
            created_at: cat.created_at,
            average_rating: cat.average_rating ?? '0.00',
            total_ratings: cat.total_ratings ?? 0,
            ...cat,
          }))
        }
        return response?.data || []
      },
      providesTags: ['Category'],
    }),
    addCategory: builder.mutation({
      query: (body) => ({
        url: '/categories/create',
        method: 'POST',
        body, // { name, icon }
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/categories/update/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation({
      query: (ids) => ({
        url: '/categories/delete',
        method: 'POST',
        body: { ids: Array.isArray(ids) ? ids : [ids] },
      }),
      invalidatesTags: ['Category'],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi
