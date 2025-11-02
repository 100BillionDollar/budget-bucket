"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import ExpenseForm from "./ExpenseForm"
    
interface Expense {
  id: string | number;
  title: string;
  category: string;
  date: string;
  amount: number;
  color: string;
}
    
interface DrawerDialogDemoProps {
  expenses: Expense[];
}
export function DrawerDialogDemo({open, setOpen,expenses=[]}) {


  return (
         <Dialog open={open} onOpenChange={setOpen}>
      
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription>
            
            </DialogDescription>
          </DialogHeader>
          <ExpenseForm expenses={expenses} setOpen={setOpen}/>
        </DialogContent>
      </Dialog>

  )
}
