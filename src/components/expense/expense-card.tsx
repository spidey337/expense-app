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
    <Link href={`/expenses/${expense.id}`}>
      <Card hoverable className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-text-primary truncate">
              {expense.store}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              {timeAgo(expense.date)}
            </p>
          </div>
          <span className="text-lg font-bold text-text-primary whitespace-nowrap">
            {formatCurrency(expense.amount)}
          </span>
        </div>

        {expense.items.length > 0 && (
          <p className="text-xs text-text-muted truncate">
            {expense.items.map((i) => i.name).join(", ")}
          </p>
        )}

        {expense.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {expense.tags.map((tag) => (
              <Badge key={tag.id} color={tag.color} className="text-[10px] px-2 py-0.5">
                <span>{tag.icon}</span>
                <span>{tag.name}</span>
              </Badge>
            ))}
          </div>
        )}
      </Card>
    </Link>
  );
}
