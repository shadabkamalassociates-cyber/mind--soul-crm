import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const virtualMeetingApi = createApi({
  reducerPath: "virtualMeetingApi",
  baseQuery: fetchBaseQuery({
    credentials: "include",
    baseUrl: "https://backend.apnasmartgate.com/api",
  }),
  tagTypes: ["VirtualMeeting"],
  endpoints: (builder) => ({
    createVirtualMeeting: builder.mutation({
      query: () => ({
        url: "/virtual-meeting/create",
        method: "POST",
      }),
      transformResponse: (response) => response.data || response,
    }),
    joinVirtualMeeting: builder.mutation({
      query: ({ meetingId }) => ({
        url: "/virtual-meeting/join",
        method: "POST",
        body: { meetingId: String(meetingId).replace(/^cosmic_guru_/, "") },
      }),
      transformResponse: (response) => response.data || response,
    }),
    joinInstantMeeting: builder.mutation({
      query: (body) => ({
        url: "/virtual-meeting/join",
        method: "POST",
        body: {
          ...body,
          meetingId: body?.meetingId ? String(body.meetingId).replace(/^cosmic_guru_/, "") : undefined,
        },
      }),
      transformResponse: (response) => response.data || response,
    }),
  }),
});

export const {
  useCreateVirtualMeetingMutation,
  useJoinVirtualMeetingMutation,
  useJoinInstantMeetingMutation,
} = virtualMeetingApi;
