import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const expertApi = createApi({
  reducerPath: 'expertApi',
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
  tagTypes: ['Expert'],
  endpoints: (builder) => ({
    getExperts: builder.query({
      query: () => '/experts/fetch-all',
      transformResponse: (response) => {
        if (response?.success && Array.isArray(response.data)) {
          return response.data.map((e) => {
            const firstName = e.first_name || ''
            const lastName = e.last_name || ''
            const fullName = `${firstName} ${lastName}`.trim() || 'Demo Expert'
            const rawStatus = (e.verification_status || 'PENDING').toLowerCase()
            const status = rawStatus === 'pending' ? 'pending' : rawStatus === 'approved' ? 'approved' : rawStatus === 'rejected' ? 'rejected' : rawStatus === 'needs_changes' ? 'needs_changes' : rawStatus

            return {
              ...e,
              id: e.id,
              name: fullName,
              first_name: e.first_name,
              last_name: e.last_name,
              email: e.email || '',
              phone: e.phone || '',
              mobile: e.phone || '',
              role: (e.role || 'EXPERT').toLowerCase(),
              bio: e.bio || 'No bio provided.',
              experience: e.experience_years ? `${e.experience_years} yrs` : 'N/A',
              experience_years: e.experience_years,
              consultation_fee: e.consultation_fee,
              avatar: e.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1e293b&color=fff`,
              is_active: e.is_active,
              status,
              verification_status: e.verification_status,
              is_verified: e.is_verified,
              rating: e.average_rating ? Number(e.average_rating).toFixed(2) : '0.00',
              average_rating: e.average_rating || '0.00',
              total_reviews: e.total_reviews ?? 0,
              total_sessions: e.total_sessions ?? 0,
              totalSessions: e.total_sessions ?? 0,
              appliedOn: e.created_at,
              created_at: e.created_at,
              categories: e.categories || [],
              skillTags: Array.isArray(e.categories) && e.categories.length > 0 ? e.categories.map((c) => c.name || c) : ['General'],
              languages: e.languages || ['English', 'Hindi'],
              certificates: e.certificates || [],
              govId: e.govId || null,
              bankVerified: e.bankVerified ?? false,
              earningsLifetime: e.earningsLifetime ?? 0,
            }
          })
        }
        return response?.data || []
      },
      providesTags: ['Expert'],
    }),
    getExpert: builder.query({
      query: (id) => `/experts/fetch-by-id/${id}`,
      transformResponse: (response) => {
        const item = Array.isArray(response?.data) ? response.data[0] : (response?.data || response)
        if (!item) return null

        const firstName = item.first_name || ''
        const lastName = item.last_name || ''
        const fullName = `${firstName} ${lastName}`.trim() || 'Demo Expert'
        const rawStatus = (item.verification_status || 'PENDING').toLowerCase()
        const status = rawStatus === 'pending' ? 'pending' : rawStatus === 'approved' ? 'approved' : rawStatus === 'rejected' ? 'rejected' : rawStatus === 'needs_changes' ? 'needs_changes' : rawStatus

        return {
          ...item,
          id: item.id,
          name: fullName,
          first_name: item.first_name,
          last_name: item.last_name,
          email: item.email || '',
          phone: item.phone || item.mobile || '',
          mobile: item.phone || item.mobile || '',
          role: (item.role || 'EXPERT').toLowerCase(),
          bio: item.bio || 'No bio provided.',
          experience: item.experience_years ? `${item.experience_years} yrs` : 'N/A',
          experience_years: item.experience_years,
          consultation_fee: item.consultation_fee,
          avatar: item.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1e293b&color=fff`,
          is_active: item.is_active,
          status,
          verification_status: item.verification_status,
          reviewNote: item.verification_reason || null,
          is_verified: item.is_verified,
          rating: item.average_rating ? Number(item.average_rating).toFixed(2) : '0.00',
          average_rating: item.average_rating || '0.00',
          total_reviews: item.total_reviews ?? 0,
          total_sessions: item.total_sessions ?? 0,
          totalSessions: item.total_sessions ?? 0,
          appliedOn: item.created_at,
          reviewedOn: item.verified_at,
          created_at: item.created_at,
          categories: item.categories || [],
          skillTags: Array.isArray(item.categories) && item.categories.length > 0 ? item.categories.map((c) => c.name || c) : ['General'],
          languages: item.languages || ['English', 'Hindi'],
          certificates: item.certificates || [],
          govId: item.govId || null,
          bankVerified: item.bankVerified ?? false,
          earningsLifetime: item.earningsLifetime ?? 0,
        }
      },
      providesTags: (result, error, id) => [{ type: 'Expert', id }],
    }),
    updateExpertStatus: builder.mutation({
      query: ({ id, status, reviewNote }) => ({
        url: `/experts/${id}/status`,
        method: 'PATCH',
        body: { status, reviewNote },
      }),
      invalidatesTags: ['Expert'],
    }),
    updateExpert: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/experts/update/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Expert', id }, 'Expert'],
    }),
    deleteExpert: builder.mutation({
      query: (ids) => ({
        url: '/experts/delete',
        method: 'DELETE',
        body: { ids: Array.isArray(ids) ? ids : [ids] },
      }),
      invalidatesTags: ['Expert'],
    }),
    blockExpert: builder.mutation({
      query: ({ id, user_id, reason }) => ({
        url: `/experts/block/${id}`,
        method: 'PATCH',
        body: { user_id: user_id || id, reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Expert', id }, 'Expert'],
    }),
    verifyExpert: builder.mutation({
      query: ({ id, user_id, status, reason }) => ({
        url: `/experts/verify/${id}`,
        method: 'PATCH',
        body: { user_id: user_id || id, status, reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Expert', id }, 'Expert'],
    }),
    expertLogin: builder.mutation({
      query: ({ phone, password }) => ({
        url: '/expert/logIn',
        method: 'POST',
        body: { phone, password },
      }),
    }),
  }),
})

export const {
  useGetExpertsQuery,
  useGetExpertQuery,
  useUpdateExpertStatusMutation,
  useUpdateExpertMutation,
  useDeleteExpertMutation,
  useBlockExpertMutation,
  useVerifyExpertMutation,
  useExpertLoginMutation,
} = expertApi

