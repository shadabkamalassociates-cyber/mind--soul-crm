import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: '/api',
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
      query: (payload) => {
        const id = payload instanceof FormData ? payload.get('id') : payload.id;
        return {
          url: `/categories/update/${id}`,
          method: 'PUT',
          body: payload,
        };
      },
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/delete/${id}`,
        method: 'DELETE',
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
