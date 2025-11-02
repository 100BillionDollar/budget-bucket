"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ExpenseForm from "./ExpenseForm";

interface Expense {
  id: string | number;
  title: string;
  category: string;
  date: string;
  amount: number;
  color: string;
}

interface DrawerDialogDemoProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  expenses?: Expense[];
}

export function DrawerDialogDemo({
  open,
  setOpen,
  expenses = [],
}: DrawerDialogDemoProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <ExpenseForm expenses={expenses} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
