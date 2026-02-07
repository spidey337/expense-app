"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, timeAgo } from "@/lib/utils";
import type { ExpenseWithDetails } from "@/hooks/use-expenses";
import Link from "next/link";

interface ExpenseCardProps {
  expense: ExpenseWithDetails;
}

export function ExpenseCard({ expense }: ExpenseCardProps) {
  return (
    <Link href={`/expenses/${expense.id}`} className="block">
      <Card hoverable className="p-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-text-primary truncate">
              {expense.store}
            </h3>
          </div>
          <span className="text-sm font-bold text-text-primary whitespace-nowrap">
            {formatCurrency(expense.amount)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {expense.tags.length > 0 && (
              <div className="flex gap-1 overflow-hidden">
                {expense.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag.id} color={tag.color} className="text-[9px] px-1.5 py-0">
                    <span>{tag.icon}</span>
                    <span>{tag.name}</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <span className="text-[10px] text-text-muted whitespace-nowrap shrink-0">
            {timeAgo(expense.date)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
