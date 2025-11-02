"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";

type BudgetSummaryProps = {
  cardInfo: {
    number: string;
    summaryTitle: string;
    subtitle?: string;
  };
};

function BudgetSummary({ cardInfo }: BudgetSummaryProps) {
    const icons = {
    dollar: DollarSign,
    trending: TrendingUp,
    calendar: Calendar
  };
  
  const Icon = icons[cardInfo.iconType];
  

  return (
       <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {cardInfo.summaryTitle}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{cardInfo.number}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {cardInfo.subtitle}
        </p>
      </CardContent>
    </Card>

  );
}

export default BudgetSummary;
