"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { selectIsDarkMode } from "@/redux/slices/themeslice";
import { useExpenseCategories } from "@/components/hooks/useExpenseCategories";
import { useSelectExpenses } from "@/components/hooks/useSelectExpenses";


const CategoryCard = () => {
   const expenses = useSelectExpenses();
  const isDarkMode = useSelector(selectIsDarkMode);
  const categories=useExpenseCategories(expenses)
  

  return (
    <Card className="col-span-4 mb-5">
      <CardHeader>
        <CardTitle className="text-[16px] font-semibold">Categories</CardTitle>
        <CardDescription>Filter by spending category</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-y-scroll scrollbar">
        {categories.map((category, index) => (
          <Button
            key={category.name}
            variant={index === 0 ? "secondary" : "ghost"}
            className={`w-full flex items-center justify-between h-auto px-3 py-2 transition-colors
              ${
                isDarkMode
                  ? index === 0
                    ? "bg-[#1f1f1f]"
                    : ""
                  : index === 0
                  ? "bg-orange-50 hover:bg-orange-100"
                  : ""
              }`}
          >
            <div className="flex items-center gap-3">
              {category.color && (
                <div className={`w-4 h-4 rounded-full ${category.color}`} />
              )}
              <span
                className={`${
                  index === 0 ? "font-medium" : ""
                } text-foreground capitalize`}
              >
                {category.name}
              </span>
            </div>
            <span
              className={`${
                isDarkMode ? "bg-[#3e3e3e]" : "bg-[#dfe0db]"
              } px-4 py-1 rounded-md font-medium`}
            >
              ₹{category.amount.toLocaleString()}
            </span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
