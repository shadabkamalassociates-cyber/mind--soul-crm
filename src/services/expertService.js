import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const parseArray = (val) => {
  if (!val) return []
  if (Array.isArray(val)) return val
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed)) return parsed
    } catch {
      // not JSON array
    }
    return val.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return []
}

export const expertApi = createApi({
  reducerPath: 'expertApi',
  baseQuery: fetchBaseQuery({
    credentials: 'include',
    baseUrl: '/api',
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
              languages: parseArray(e.languagesArray || e.languages || ['English', 'Hindi']),
              certificates: parseArray(e.certificationsValue || e.certificates || []),
              govId: e.govId || null,
              bankVerified: e.bankVerified ?? false,
              earningsLifetime: e.earningsLifetime ?? 0,
              alternate_phone: e.alternate_phone || null,
              cover_image: e.cover_image || null,
              country: e.country || null,
              timezone: e.timezone || null,
              professional_title: e.professional_title || null,
              profession: e.profession || null,
              whatsapp_number: e.whatsapp_number || null,
              city: e.city || null,
              state: e.state || null,
              education: e.education || null,
              certificationsValue: e.certificationsValue || null,
              specialization: e.specialization || null,
              languagesArray: e.languagesArray || null,
              about: e.about || null,
              why_started: e.why_started || null,
              mission: e.mission || null,
              client_approach: e.client_approach || null,
              uniqueness: e.uniqueness || null,
              profile_completed: e.profile_completed || false,
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
          languages: parseArray(item.languagesArray || item.languages || ['English', 'Hindi']),
          certificates: parseArray(item.certificationsValue || item.certificates || []),
          govId: item.govId || null,
          bankVerified: item.bankVerified ?? false,
          earningsLifetime: item.earningsLifetime ?? 0,
          alternate_phone: item.alternate_phone || null,
          cover_image: item.cover_image || null,
          country: item.country || null,
          timezone: item.timezone || null,
          professional_title: item.professional_title || null,
          profession: item.profession || null,
          whatsapp_number: item.whatsapp_number || null,
          city: item.city || null,
          state: item.state || null,
          education: item.education || null,
          certificationsValue: item.certificationsValue || null,
          specialization: item.specialization || null,
          languagesArray: item.languagesArray || null,
          about: item.about || null,
          why_started: item.why_started || null,
          mission: item.mission || null,
          client_approach: item.client_approach || null,
          uniqueness: item.uniqueness || null,
          profile_completed: item.profile_completed || false,
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
        body: body.formData || body,
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
    expertSignUp: builder.mutation({
      query: (body) => ({
        url: '/expert/signUp',
        method: 'POST',
        body: body.formData || body,
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
  useExpertSignUpMutation,
} = expertApi

