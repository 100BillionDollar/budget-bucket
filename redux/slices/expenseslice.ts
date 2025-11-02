
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { subDays, subYears, isAfter } from "date-fns";

const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:3000/api';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category?: string;
  date?: string;
  [key: string]: any;
}

export interface ExpenseCreateData {
  amount: number;
  description: string;
  category?: string;
  date?: string;
  [key: string]: any;
}

export interface ExpenseUpdateData {
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
  [key: string]: any;
}

interface ExpensesState {
  expenses: Expense[];
  currentExpense: Expense | null;
  loading: boolean;
   timePeriod: string; 
  error: string | null;
}

export const fetchExpenses = createAsyncThunk<Expense[], void, { rejectValue: string }>(
  'expenses/fetchExpenses',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/expenses`);
      if (!res.ok) throw new Error('Failed to fetch expenses');
      return await res.json();
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
    }
  }
);

export const fetchExpenseById = createAsyncThunk<Expense, string, { rejectValue: string }>(
  'expenses/fetchExpenseById',
  async (expense, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/expenses/${expense?.id}`);
      if (!res.ok) throw new Error('Failed to fetch expense');
      return await res.json();
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
    }
  }
); 

export const createExpense = createAsyncThunk<Expense, ExpenseCreateData, { rejectValue: string }>(
  'expenses/createExpense',
  async (expenseData, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });
      if (!res.ok) throw new Error('Failed to create expense');
      return await res.json();
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
    }
  }
);

export const updateExpense = createAsyncThunk<
  Expense,
  { id: string; amount: ExpenseUpdateData, description: ExpenseUpdateData },
  { rejectValue: string }
>(
  'expenses/updateExpense',
  async (expenseData, { rejectWithValue }) => {
    console.log("Updating expense in thunk:", expenseData);
    try {
      const res = await fetch(`${API_URL}/expenses/${expenseData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });
      if (!res.ok) throw new Error('Failed to update expense');
      return await res.json();
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
    }
  }
);

export const deleteExpense = createAsyncThunk<string, string, { rejectValue: string }>(
  'expenses/deleteExpense',
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete expense');
      return id;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error');
    }
  }
);

const initialState: ExpensesState = {
  expenses: [],
  currentExpense: null,
  loading: false,
  error: null,
    timePeriod: "all", 
};




const expensesPeriodSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentExpense: (state) => {
      state.currentExpense = null;
    },
    setTimePeriod: (state, action: PayloadAction<string>) => {
      state.timePeriod = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action: PayloadAction<Expense[]>) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch expenses';
      })
      .addCase(fetchExpenseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenseById.fulfilled, (state, action: PayloadAction<Expense>) => {
        state.loading = false;
        state.currentExpense = action.payload;
      })
      .addCase(fetchExpenseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch expense';
      })
      .addCase(createExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
        state.loading = false;
        state.expenses.push(action.payload);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create expense';
      })
      .addCase(updateExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
        state.loading = false;
        const idx = state.expenses.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.expenses[idx] = action.payload;
        if (state.currentExpense?.id === action.payload.id) {
          state.currentExpense = action.payload;
        }
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update expense';
      })
      .addCase(deleteExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.expenses = state.expenses.filter((e) => e.id !== action.payload);
        if (state.currentExpense?.id === action.payload) {
          state.currentExpense = null;
        }
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.loading = false;  
        state.error = action.payload || 'Failed to delete expense';
      });
  },
});

export const { clearError, clearCurrentExpense,setTimePeriod } = expensesPeriodSlice.actions;
export default expensesPeriodSlice.reducer;

// Selectors
export const selectExpenses = (state: { expenses: ExpensesState }) => state.expenses.expenses;
export const selectCurrentExpense = (state: { expenses: ExpensesState }) => state.expenses.currentExpense;
export const selectLoading = (state: { expenses: ExpensesState }) => state.expenses.loading;
export const selectError = (state: { expenses: ExpensesState }) => state.expenses.error;  

export const selectTimePeriod = (state: { expenses: ExpensesState }) =>
  state.expenses.timePeriod;

export const selectFilteredExpenses = (state: { expenses: ExpensesState }) => {
  const { expenses, timePeriod } = state.expenses;

  if (timePeriod === "all") return expenses;

  const now = new Date();
  let startDate: Date | null = null;

  switch (timePeriod) {
    case "7":
      startDate = subDays(now, 7);
      break;
    case "30":
      startDate = subDays(now, 30);
      break;
    case "90":
      startDate = subDays(now, 90);
      break;
    case "year":
      startDate = subYears(now, 1);
      break;
  }

  if (!startDate) return expenses;

  return expenses.filter((exp) => {
    if (!exp.date) return false;
    const expDate = new Date(exp.date);
    return isAfter(expDate, startDate);
  });
};  