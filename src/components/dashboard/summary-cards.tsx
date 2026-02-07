"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { SkeletonLine } from "@/components/ui/loading";
import type { ExpenseWithDetails } from "@/hooks/use-expenses";

interface SummaryCardsProps {
  expenses: ExpenseWithDetails[] | undefined;
  isLoading: boolean;
}

export function SummaryCards({ expenses, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 xs:gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="space-y-2 p-3 xs:p-4">
            <SkeletonLine className="h-3 w-16" />
            <SkeletonLine className="h-6 w-20" />
          </Card>
        ))}
      </div>
    );
  }

  const total = expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) ?? 0;
  const dailyAvg = total / 14;

  return (
    <div className="grid grid-cols-2 gap-2 xs:gap-3">
      <Card className="p-3 xs:p-4">
        <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
          2 Weeks
        </p>
        <p className="text-base xs:text-lg font-bold mt-1">{formatCurrency(total)}</p>
      </Card>
      <Card className="p-3 xs:p-4">
        <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
          Daily Avg
        </p>
        <p className="text-base xs:text-lg font-bold mt-1">{formatCurrency(dailyAvg)}</p>
      </Card>
    </div>
  );
}
