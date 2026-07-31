import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const blogApi = createApi({
  reducerPath: "blogApi",
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: 'https://backend.apnasmartgate.com/api',
  }),
  tagTypes: ["Blog", "BlogCategory"],
  endpoints: (builder) => ({
    getBlogs: builder.query({
      query: () => "/blogs/get-all",
      transformResponse: (response) => {
        if (response?.success && Array.isArray(response.data)) {
          return response.data;
        }
        return response?.data || [];
      },
      providesTags: ["Blog"],
    }),
    getBlogCategories: builder.query({
      query: () => "/blogs/get-categories",
      transformResponse: (response) => {
        if (response?.success && Array.isArray(response.data)) {
          return response.data;
        }
        return response?.data || [];
      },
      providesTags: ["BlogCategory"],
    }),
    getBlogCategoryById: builder.query({
      query: (id) => `/blogs/get-category-by-id/${id}`,
      transformResponse: (response) => {
        return response?.data || response;
      },
      providesTags: (result, error, id) => [{ type: "BlogCategory", id }],
    }),
    getBlogsByCategory: builder.query({
      query: (categoryId) => `/blogs/get-blogs-by-category/${categoryId}`,
      transformResponse: (response) => {
        if (response?.success && Array.isArray(response.data)) {
          return response.data;
        }
        return response?.data || [];
      },
      providesTags: ["Blog"],
    }),
    createBlog: builder.mutation({
      query: (formData) => ({
        url: "/blogs/create",
        method: "POST",
        body: formData, // FormData instance
      }),
      invalidatesTags: ["Blog"],
    }),
    updateBlog: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/blogs/update-blog/${id}`,
        method: "PUT",
        body: formData, // FormData instance
      }),
      invalidatesTags: ["Blog"],
    }),
    deleteBlog: builder.mutation({
      query: (id) => ({
        url: `/blogs/delete-blog/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blog"],
    }),
    createBlogCategory: builder.mutation({
      query: (formData) => ({
        url: "/blogs/create-category",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["BlogCategory"],
    }),
    updateBlogCategory: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/blogs/update-category/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["BlogCategory"],
    }),
    deleteBlogCategory: builder.mutation({
      query: (id) => ({
        url: `/blogs/delete-category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BlogCategory"],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetBlogCategoriesQuery,
  useGetBlogCategoryByIdQuery,
  useGetBlogsByCategoryQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useCreateBlogCategoryMutation,
  useUpdateBlogCategoryMutation,
  useDeleteBlogCategoryMutation,
} = blogApi;
