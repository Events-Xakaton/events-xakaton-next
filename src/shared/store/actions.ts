import { createAction } from '@reduxjs/toolkit';

/**
 * Диспатчится из baseQuery при получении 401.
 * auth-slice обрабатывает это действие через extraReducers
 * и сбрасывает состояние авторизации.
 */
export const sessionExpired = createAction('session/expired');