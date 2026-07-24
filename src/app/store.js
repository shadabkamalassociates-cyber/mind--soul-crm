import { configureStore } from '@reduxjs/toolkit'
import { categoryApi } from '../services/categoryService'
import { expertApi } from '../services/expertService'
import { authApi } from '../services/authService'
import { serviceApi } from '../services/serviceService'
import { userApi } from '../services/userService'
import { bookingApi } from '../services/bookingService'
import { reviewApi } from '../services/reviewService'
import { couponApi } from '../services/couponService'
import { payoutApi } from '../services/payoutService'
import { settingsApi } from '../services/settingsService'
import authReducer from '../features/auth/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [expertApi.reducerPath]: expertApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [serviceApi.reducerPath]: serviceApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [couponApi.reducerPath]: couponApi.reducer,
    [payoutApi.reducerPath]: payoutApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(
      categoryApi.middleware,
      expertApi.middleware,
      authApi.middleware,
      serviceApi.middleware,
      userApi.middleware,
      bookingApi.middleware,
      reviewApi.middleware,
      couponApi.middleware,
      payoutApi.middleware,
      settingsApi.middleware
    ),
})
