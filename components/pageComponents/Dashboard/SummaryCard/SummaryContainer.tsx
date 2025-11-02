import React from "react";
import BudgetSummary from "./SummaryCard";
import { useSelectExpenses } from "@/components/hooks/useSelectExpenses";

interface CardInfo {
  summaryTitle: string;
  subtitle: string;
  number: string;
  iconType: "dollar" | "trending" | "calendar";
}


const SummaryContainer: React.FC = () => {
  const expenses = useSelectExpenses();
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categories = new Set(expenses.map((exp) => exp.category));

  const transactions = expenses.length;

  const cardObj: CardInfo[] = [
    {
      summaryTitle: "Total Spent",
      subtitle: "This month",
      number: `$${totalSpent.toFixed(2)}`,
      iconType: "dollar",
    },
    {
      summaryTitle: "Categories",
      subtitle: "Active buckets",
      number: `${categories.size}`,
      iconType: "trending",
    },
    {
      summaryTitle: "Transactions",
      subtitle: "This month",
      number: `${transactions}`,
      iconType: "calendar",
    },
  ];

  return (
    <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-5">
      {cardObj.map((item, index) => (
        <BudgetSummary key={index} cardInfo={item} />
      ))}
    </div>
  );
};

export default SummaryContainer;
