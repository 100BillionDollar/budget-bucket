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
import { SquarePen, Trash2, Upload, Download, Eye, X } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as XLSX from "xlsx";

interface Expense {
  id: string | number;
  description: string;
  category: string;
  date: string;
  amount: number;
  receipt?: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentExpenseId, setCurrentExpenseId] = useState<string | number | null>(null);
  const [receipts, setReceipts] = useState<Record<string | number, string>>({});
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);


  // Load receipts from localStorage on mount
  useEffect(() => {
    const savedReceipts = localStorage.getItem("expenseReceipts");
    if (savedReceipts) {
      setReceipts(JSON.parse(savedReceipts));
    }
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      let cat = categories.map((c) => ({
        name: c.name,
        limit: Math.floor(Math.random() * 1000) + 500,
      }));
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
                // Remove receipt from localStorage
                const updatedReceipts = { ...receipts };
                delete updatedReceipts[expense.id];
                setReceipts(updatedReceipts);
                localStorage.setItem("expenseReceipts", JSON.stringify(updatedReceipts));
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

  const handleReceiptUpload = (expenseId: string | number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const receiptData = reader.result as string;
      const updatedReceipts = { ...receipts, [expenseId]: receiptData };
      setReceipts(updatedReceipts);
      localStorage.setItem("expenseReceipts", JSON.stringify(updatedReceipts));
      toast.success("Receipt uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleViewReceipt = (expenseId: string | number) => {
    const receipt = receipts[expenseId];
    if (receipt) {
      setViewingReceipt(receipt);
    } else {
      toast.error("No receipt found for this expense");
    }
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
    <>
      <Card className="col-span-4 mb-[20px] transition-colors">
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

        <CardContent className="space-y-3 scrollbar sm:space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin">
          {filteredExpenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No expenses found
            </p>
          ) : (
            filteredExpenses.map((expense) => {
              const categoryColor = getCategoryColor(expense.category);
              const hasReceipt = !!receipts[expense.id];

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
                        onClick={() => {
                          setCurrentExpenseId(expense.id);
                          fileInputRef.current?.click();
                        }}
                        className="cursor-pointer"
                        title="Upload Receipt"
                      >
                        <Upload className={`h-4 w-4 cursor-pointer ${hasReceipt ? 'text-green-500' : 'text-blue-500'}`} />
                      </Button>

                      {hasReceipt && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                          onClick={() => handleViewReceipt(expense.id)}
                          title="View Receipt"
                        >
                          <Eye className="h-4 w-4 cursor-pointer text-purple-500" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(expense)}
                        title="Edit Expense"
                        className=" cursor-pointer"
                      >
                        <SquarePen className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        
                        className="text-red-500 hover:text-red-600 cursor-pointer"
                        onClick={() => handleDelete(expense)}
                        title="Delete Expense"
                      >
                        <Trash2 className="h-4 w-4 cursor-pointer" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && currentExpenseId) {
            handleReceiptUpload(currentExpenseId, e.target.files[0]);
          }
        }}
      />

      <Dialog open={!!viewingReceipt} onOpenChange={() => setViewingReceipt(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[70vh] overflow-auto">
            {viewingReceipt && (
              viewingReceipt.startsWith('data:application/pdf') ? (
                <iframe
                  src={viewingReceipt}
                  className="w-full h-full"
                  title="Receipt PDF"
                />
              ) : (
                <img
                  src={viewingReceipt}
                  alt="Receipt"
                  className="w-full h-auto object-contain"
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecentExpensesContainer;