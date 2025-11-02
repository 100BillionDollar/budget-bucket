"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchExpenses,clearCurrentExpense } from "@/redux/slices/expenseslice";

import SummaryContainer from "@/components/pageComponents/Dashboard/SummaryCard/SummaryContainer";
import CategoryCard from "@/components/pageComponents/Dashboard/Categories/CategoryContainer";
import SpendingDistContainer from "@/components/pageComponents/Dashboard/SpendingDistribution/SpendingDistContainer";
import RecentExpensesContainer from "@/components/pageComponents/Dashboard/RecentExpenses/RecentExpensesContainer";
import TimePeriodContainer from "@/components/pageComponents/Dashboard/TimePeriod/TimePeriodContainer";
import { Button } from "@/components/ui/button";
import DashboardLayout from "./DashboardLayout";
import { DrawerDialogDemo } from "@/components/pageComponents/modal";
import { Toaster } from "react-hot-toast";
const DashboardPage: React.FC = () => {
  const  [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchExpenses());
      
  }, [dispatch]);

  return (
    <DashboardLayout>
    <div className="min-h-screen p-4 pt-8 lg:p-8">
      <div className="flex justify-between mb-10">
        <div className="content">
          <h1 className="text-2xl font-semibold">Budget Buckets</h1>
          <p>Track your expenses and manage your budget</p>
        </div>
        <Button className="cursor-pointer" onClick={()=>{
           dispatch(clearCurrentExpense());
          setOpen(true)
          }}>+ Add Expense</Button>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12">
          <SummaryContainer />
        </div>

        <div className="col-span-12 md:col-span-4 space-y-5">
          <CategoryCard/>
          <TimePeriodContainer/>
        </div>

        <div className="col-span-12 md:col-span-8 space-y-5">
          <SpendingDistContainer/>
          <RecentExpensesContainer setOpen={setOpen}/>
        </div>
      </div>
    </div>
    <DrawerDialogDemo open={open}setOpen={setOpen} />
    <Toaster
  position="top-center"
  reverseOrder={false}
/>
    </DashboardLayout>
  );
};

export default DashboardPage;
