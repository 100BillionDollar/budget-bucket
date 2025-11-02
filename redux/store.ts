"use client"
import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeslice'
import expensesReducer from './slices/expenseslice';
export const store = configureStore({
  reducer: {
    theme: themeReducer,
    expenses: expensesReducer,
  },
});

