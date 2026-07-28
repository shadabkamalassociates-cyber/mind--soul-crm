import { createSlice } from '@reduxjs/toolkit'

const stored = (() => {
  try { return JSON.parse(sessionStorage.getItem('soulsensei_session')) } catch { return null }
})()

const initialState = {
  user: stored?.user || null,
  role: stored?.user?.role ? stored.user.role.toLowerCase() : null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user } = action.payload
      state.user = user
      state.role = user?.role ? user.role.toLowerCase() : null
      sessionStorage.setItem('soulsensei_session', JSON.stringify({ user }))
    },
    logout(state) {
      state.user = null
      state.role = null
      sessionStorage.removeItem('soulsensei_session')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer

