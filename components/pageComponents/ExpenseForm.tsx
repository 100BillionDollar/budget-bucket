"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentExpense,
  clearCurrentExpense,
  createExpense,
  updateExpense,
} from "@/redux/slices/expenseslice";
import { DatePicker } from "@/components/ui/datepicker";
import { useExpenseCategories } from "../hooks/useExpenseCategories";

interface ExpenseData {
  id?: string | number;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface Expense {
  id?: string | number;
  category: string;
  amount: number;
}

interface ExpenseFormProps {
  expenses?: Expense[];
  onSubmit?: (data: ExpenseData) => void;
  onUpdate?: (data: ExpenseData) => void;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  expenses = [],
  onSubmit,
  onUpdate,
  setOpen,
}) => {
  const dispatch = useDispatch();
  const currentExpense = useSelector(selectCurrentExpense);
  const isEditMode = !!currentExpense;

  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>("");

  const categories = useExpenseCategories(expenses);

  const resetForm = useCallback(() => {
    setAmount("");
    setCategory("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    dispatch(clearCurrentExpense());
  }, [dispatch]);

  useEffect(() => {
    if (currentExpense) {
      setAmount(currentExpense.amount?.toString() || "");
      setCategory(currentExpense.category || "");
      setDescription((currentExpense as any).description || "");
      if ((currentExpense as any).date) {
        setDate((currentExpense as any).date);
      }
    } else {
      resetForm();
    }
  }, [currentExpense, resetForm]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!amount.trim() || !category || !description.trim() || !date) {
        toast.error("Please fill all fields");
        return;
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      const expenseData: ExpenseData = {
        amount: parsedAmount,
        category,
        description: description.trim(),
        date,
      };

      if (isEditMode && currentExpense?.id) {
        expenseData.id = currentExpense.id;
        dispatch(updateExpense(expenseData));
        toast.success("Expense updated successfully!");
      } else {
        dispatch(createExpense(expenseData));
        toast.success("Expense added successfully!");
      }

      resetForm();
      if (setOpen) setOpen(false);
    },
    [amount, category, description, date, isEditMode, currentExpense, dispatch, resetForm, setOpen]
  );

  const handleCancel = useCallback(() => {
    toast("Edit cancelled", { icon: "✖️" });
    if (setOpen) setOpen(false);
  }, [setOpen]);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 p-4 bg-card border rounded-xl shadow-sm"
    >
      {isEditMode && (
        <div className="pb-2 border-b">
          <h3 className="text-lg font-semibold">Edit Expense</h3>
        </div>
      )}

      <div className="space-y-2">
        <Label>Date</Label>
        <DatePicker date={date} onChange={setDate} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          type="text"
          placeholder="Enter Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Write a short note about this expense"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          {isEditMode ? "Update Expense" : "Add Expense"}
        </Button>

        {isEditMode && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default ExpenseForm;
