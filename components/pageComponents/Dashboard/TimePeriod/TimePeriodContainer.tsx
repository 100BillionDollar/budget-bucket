"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectFilteredExpenses, selectTimePeriod, setTimePeriod } from "@/redux/slices/expenseslice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ExpensesList() {
  const dispatch = useDispatch();
  
  const filteredExpenses = useSelector(selectFilteredExpenses);
  const timePeriod = useSelector(selectTimePeriod);

  return (
    <Card className="col-span-4">
      <CardHeader className="">
        <CardTitle>Time Period</CardTitle>

        <Select
          value={timePeriod}
          onValueChange={(value) => dispatch(setTimePeriod(value))}
        >
          <SelectTrigger className="w-[100%] mt-4">
            <SelectValue placeholder="Select Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
    </Card>
  );
}
