import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

function buildSessionFormData(body, thumbnailFile) {
  const formData = new FormData();

  Object.entries(body).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    formData.append(key, typeof value === "number" ? String(value) : value);
  });

  if (thumbnailFile) {
    formData.append("thumbnail", thumbnailFile);
  }

  return formData;
}

export const serviceApi = createApi({
  reducerPath: "serviceApi",
  baseQuery: fetchBaseQuery({
    credentials: "include",
    baseUrl: "https://backend.apnasmartgate.com/api",
  }),
  tagTypes: ["Service", "Session"],
  endpoints: (builder) => ({
    getServices: builder.query({
      query: () => ({ url: "/services", method: "GET" }),
      providesTags: ["Service"],
    }),
    getAllSessions: builder.query({
      query: () => ({ url: "/sessions/fetch-all", method: "GET" }),
      transformResponse: (response) => response.data || response,
      providesTags: ["Session"],
    }),
    getSessionsByExpert: builder.query({
      query: (expertId) => `/sessions/fetch-by-expert/${expertId}`,
      transformResponse: (response) => response.data || response,
      providesTags: (r, e, expertId) => [
        { type: "Session", id: expertId },
        "Session",
      ],
    }),
    getService: builder.query({
      query: (id) => ({ url: `/services/${id}`, method: "GET" }),
      providesTags: (r, e, id) => [{ type: "Service", id }],
    }),
    getSession: builder.query({
      query: (id) => ({ url: `/sessions/fetch/${id}`, method: "GET" }),
      transformResponse: (response) => response.data || response,
      providesTags: (r, e, id) => [{ type: "Session", id }],
    }),
    addService: builder.mutation({
      query: (body) => ({ url: "/services", method: "POST", body }),
      invalidatesTags: ["Service"],
    }),
    updateService: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/services/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Service"],
    }),
    updateServiceStatus: builder.mutation({
      query: ({ id, status, reviewNote }) => ({
        url: `/services/${id}/status`,
        method: "PATCH",
        body: { status, reviewNote },
      }),
      invalidatesTags: ["Service"],
    }),
    updateServiceVideoStatus: builder.mutation({
      query: ({ id, videoStatus, videoReviewNote }) => ({
        url: `/services/${id}/video-status`,
        method: "PATCH",
        body: { videoStatus, videoReviewNote },
      }),
      invalidatesTags: ["Service"],
    }),
    deleteService: builder.mutation({
      query: (id) => ({ url: `/services/${id}`, method: "DELETE" }),
      invalidatesTags: ["Service"],
    }),
    createSession: builder.mutation({
      query: ({ thumbnailFile, ...body }) => ({
        url: "/sessions/create",
        method: "POST",
        body: buildSessionFormData(body, thumbnailFile),
      }),
      invalidatesTags: ["Session"],
    }),
    updateSession: builder.mutation({
      query: ({ id, thumbnailFile, ...body }) => ({
        url: `/sessions/update/${id}`,
        method: "PUT",
        body: buildSessionFormData(body, thumbnailFile),
      }),
      invalidatesTags: ["Session"],
    }),
    deleteSessions: builder.mutation({
      query: (ids) => ({
        url: "/sessions/delete",
        method: "DELETE",
        body: { ids: Array.isArray(ids) ? ids : [ids] },
      }),
      invalidatesTags: ["Session"],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceQuery,
  useAddServiceMutation,
  useUpdateServiceMutation,
  useUpdateServiceStatusMutation,
  useUpdateServiceVideoStatusMutation,
  useDeleteServiceMutation,
  useGetSessionsByExpertQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionsMutation,
  useGetAllSessionsQuery,
  useGetSessionQuery,
} = serviceApi;
