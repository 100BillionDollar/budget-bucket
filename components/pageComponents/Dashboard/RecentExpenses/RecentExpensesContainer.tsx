"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SquarePen, Trash2, Upload, Download, Repeat } from "lucide-react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { format, isWithinInterval } from "date-fns";
import { deleteExpense, fetchExpenseById } from "@/redux/slices/expenseslice";
import { useExpenseCategories } from "@/components/hooks/useExpenseCategories";
import { useSelectExpenses } from "@/components/hooks/useSelectExpenses";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import * as XLSX from "xlsx";

interface Expense {
  id: string | number;
  description: string;
  category: string;
  date: string;
  amount: number;
  receipt?: string; // receipt URL
  recurring?: boolean;
}

interface CategoryBudget {
  name: string;
  limit: number;
}

interface RecentExpensesContainerProps {
  setOpen?: (value: boolean) => void;
}

const RecentExpensesContainer: React.FC<RecentExpensesContainerProps> = ({
  setOpen = () => {},
}) => {
  const dispatch = useDispatch();
  const expenses = useSelectExpenses();
    const categories = useExpenseCategories(expenses);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (categories.length > 0) {
         let cat=  categories.map((c) => (
            {
          name: c.name,
          limit: Math.floor(Math.random() * 1000) + 500, 
        }))
      setBudgets(
     cat
      );
    }
  }, [categories]);

  const handleEdit = (expense: Expense) => {
    dispatch(fetchExpenseById(expense));
    setOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium">Are you sure you want to delete?</p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                dispatch(deleteExpense(expense.id));
                toast.dismiss(t.id);
                toast.success("Expense deleted successfully!");
              }}
            >
              Yes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.dismiss(t.id)}
            >
              No
            </Button>
          </div>
        </div>
      ),
      { duration: 4000, position: "top-center" }
    );
  };

  const getCategoryColor = (category: string) => {
    const matched = categories.find((c) => c.name === category);
    return matched?.color || "bg-gray-400";
  };

  const handleClearFilters = () => {
    setSelectedCategory("All");
    setDateRange({});
  };

  // 🧾 Upload Receipt
  const handleReceiptUpload = (expenseId: string | number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      toast.success("Receipt attached successfully!");
      console.log("Receipt uploaded for:", expenseId, reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 💾 CSV Export
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) {
      toast.error("No data to export!");
      return;
    }

    const data = filteredExpenses.map((exp) => ({
      Description: exp.description,
      Category: exp.category,
      Date: format(new Date(exp.date), "PPP"),
      Amount: exp.amount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    XLSX.writeFile(workbook, "Expense_Report.csv");

    toast.success("CSV exported successfully!");
  };

  const getBudgetWarning = (category: string) => {
    const categoryExpenses = expenses
      .filter((e) => e.category === category)
      .reduce((acc, e) => acc + e.amount, 0);

    const budget = budgets.find((b) => b.name === category);
    if (!budget) return null;

    const percent = (categoryExpenses / budget.limit) * 100;
    if (percent >= 100) return "text-red-500"; 
    if (percent >= 75) return "text-yellow-500"; 
    return "text-green-500";
  };

//   const handleMarkRecurring = (expense: Expense) => {
//     toast.success(`"${expense.description}" saved as recurring template!`);
//   };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const categoryMatch =
        selectedCategory === "All" || exp.category === selectedCategory;

      const date = new Date(exp.date);
      const dateMatch =
        !dateRange.from ||
        !dateRange.to ||
        isWithinInterval(date, {
          start: dateRange.from,
          end: dateRange.to,
        });

      return categoryMatch && dateMatch;
    });
  }, [expenses, selectedCategory, dateRange]);

  return (
    <Card className="col-span-4 mb-[20px]  transition-colors">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl font-semibold">
                Recent Expenses
              </CardTitle>
              <CardDescription className="text-sm">
                Track and manage all transactions
              </CardDescription>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-end">
            <div className="flex flex-col flex-1 min-w-[140px]">
              <Label className="text-xs mb-1.5">Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={(val) => setSelectedCategory(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col flex-1 min-w-[180px]">
              <Label className="text-xs mb-1.5">Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {(selectedCategory !== "All" ||
              (dateRange.from && dateRange.to)) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs w-full sm:w-auto"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin">
        {filteredExpenses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No expenses found
          </p>
        ) : (
          filteredExpenses.map((expense) => {
            const categoryColor = getCategoryColor(expense.category);
            const warningColor = getBudgetWarning(expense.category);

            return (
              <div
                key={expense.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${categoryColor} flex items-center justify-center text-white font-semibold text-lg sm:text-xl shadow-sm flex-shrink-0`}
                  >
                    $
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground text-sm sm:text-base truncate">
                      {expense.description}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {expense.category} • {format(new Date(expense.date), "PPP")}
                    </p>

                    <p className={`text-xs font-medium ${warningColor}`}>
                      Budget usage:{" "}
                      {budgets.find((b) => { 
                        console.log(b)
                        return b.name === expense.category})
  ? `${Math.min(
      100,
      Math.round(
        (expenses
          .filter((e) => e.category === expense.category)
          .reduce((a, b) => a + b.amount, 0) /
          budgets.find((b) => b.name === expense.category)!.limit) * 100
      )
    )}%`
  : "N/A"}

                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                  <span className="text-lg sm:text-xl font-semibold whitespace-nowrap">
                    ${expense.amount.toFixed(2)}
                  </span>

                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 text-blue-500" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files &&
                        handleReceiptUpload(expense.id, e.target.files[0])
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(expense)}
                    >
                      <SquarePen className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(expense)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default RecentExpensesContainer;
