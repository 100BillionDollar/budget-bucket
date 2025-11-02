"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useExpenseCategories } from "@/components/hooks/useExpenseCategories";
import { useSelectExpenses } from "@/components/hooks/useSelectExpenses";

const SpendingDistContainer = () => {
     const expenses = useSelectExpenses();
    const categories = useExpenseCategories(expenses);
    
 const grouped: Record<string, number> = {};
    expenses.forEach((exp) => {
      grouped[exp.category] = (grouped[exp.category] || 0) + exp.amount;
    });

    const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.amount, 0);

  

  return (  
    <Card className="col-span-8 mb-5">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Spending Distribution
        </CardTitle>
        <CardDescription>
          Visual breakdown by category (Total: ₹{totalSpent.toLocaleString()})
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 max-h-[400px] overflow-y-scroll scrollbar">
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground">No expenses found.</p>
        )}

        {categories.map((category) => (
        category.name!="All Categories" && <div key={category.name}>
            <div className="flex items-center justify-between group hover:bg-muted/50 p-2 px-0 rounded-md transition-colors">
              <div className="flex items-center gap-3 flex-shrink-0 w-36">
                <div
                  className={`size-2.5 rounded-full ${category.color} group-hover:scale-110 transition-transform`}
                ></div>
                <span className="text-sm truncate">{category.name}</span>
              </div>

              <span className="flex-shrink-0 text-sm font-medium text-foreground">
                ₹{category.amount.toLocaleString()}
              </span>
            </div>

            <div className="flex-1 h-2 bg-[#dfe0db] rounded-full">
              <div
                className={`h-full rounded-full ${category.color} transition-all duration-300`}
                style={{ width:total > 0 ? `${((category.amount / total) * 100).toFixed(1)}%` : "0%" }}
              ></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SpendingDistContainer;
