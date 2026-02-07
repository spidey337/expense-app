"use client";

import { ExpenseCard } from "@/components/expense/expense-card";
import { SkeletonCard } from "@/components/ui/loading";
import type { ExpenseWithDetails } from "@/hooks/use-expenses";
import Link from "next/link";

interface RecentListProps {
  expenses: ExpenseWithDetails[] | undefined;
  isLoading: boolean;
}

export function RecentList({ expenses, isLoading }: RecentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="skeleton h-5 w-32 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const recent = expenses?.slice(0, 10) ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-secondary">Recent</h3>
        {(expenses?.length ?? 0) > 0 && (
          <Link
            href="/expenses"
            className="text-xs text-primary hover:text-primary-light transition-colors"
          >
            View all
          </Link>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-text-muted">No expenses yet</p>
          <p className="text-xs text-text-muted mt-1">
            Tap + to add your first expense
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {recent.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </div>
      )}
    </div>
  );
}
