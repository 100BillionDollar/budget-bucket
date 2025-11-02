"use client";

import { useSelector } from "react-redux";
import { selectFilteredExpenses } from "@/redux/slices/expenseslice";

export const useSelectExpenses = () => {
  const expenses = useSelector(selectFilteredExpenses);
  return expenses;
};
