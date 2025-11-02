"use client";

import { useMemo, useRef, useEffect } from "react";

export interface Expense {
  id?: string | number;
  category: string;
  amount: number;
}

export interface CategorySummary {
  name: string;
  amount: number;
  color: string;
}

export function useExpenseCategories(expenses: Expense[]) {
  // Check if window is defined (client-side)
  const isClient = typeof window !== "undefined";

  // Initialize colorMapRef with localStorage check
  const colorMapRef = useRef<Record<string, string>>(
    isClient && localStorage
      ? JSON.parse(localStorage.getItem("categoryColors") || "{}")
      : {}
  );

  // Tailwind color palette
  const tailwindColors = [
    "bg-rose-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-lime-500",
    "bg-amber-500",
    "bg-fuchsia-500",
    "bg-sky-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-red-500",
    "bg-gray-500",
  ];

  const getRandomColor = () =>
    tailwindColors[Math.floor(Math.random() * tailwindColors.length)];

  const categories = useMemo(() => {
    const grouped: Record<string, number> = {};

    // Group by category
    expenses.forEach((exp) => {
      if (!exp.category) return;
      grouped[exp.category] = (grouped[exp.category] || 0) + exp.amount;
    });

    // Assign colors (persisting existing)
    Object.keys(grouped).forEach((category) => {
      if (!colorMapRef.current[category]) {
        colorMapRef.current[category] = getRandomColor();
      }
    });

    const categoryList: CategorySummary[] = Object.entries(grouped).map(
      ([name, amount]) => ({
        name,
        amount,
        color: colorMapRef.current[name],
      })
    );

    const totalAmount = categoryList.reduce((sum, c) => sum + c.amount, 0);

    return [
      { name: "All Categories", amount: totalAmount, color: "bg-neutral-400" },
      ...categoryList,
    ];
  }, [expenses]);

  // Persist color map changes to localStorage (client-side only)
  useEffect(() => {
    if (isClient && localStorage) {
      try {
        localStorage.setItem("categoryColors", JSON.stringify(colorMapRef.current));
      } catch (error) {
        console.error("Failed to save category colors to localStorage:", error);
      }
    }
  }, [categories, isClient]);

  return categories;
}