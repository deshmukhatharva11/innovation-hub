import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import ideaSlice from './slices/ideaSlice';
import userSlice from './slices/userSlice';
import notificationSlice from './slices/notificationSlice';
import themeSlice from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ideas: ideaSlice,
    users: userSlice,
    notifications: notificationSlice,
    theme: themeSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
