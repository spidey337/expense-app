"use client";

import { useExpenses } from "@/hooks/use-expenses";
import { useTags } from "@/hooks/use-tags";
import { useExpenseStore } from "@/stores/expense-store";
import { ExpenseCard } from "@/components/expense/expense-card";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard, PageLoader } from "@/components/ui/loading";
import { formatCurrency } from "@/lib/utils";

export default function ExpensesPage() {
  const { filterTagIds, toggleFilterTag, clearFilters } = useExpenseStore();
  const { data: tags } = useTags();
  const { data: expenses, isLoading } = useExpenses(
    filterTagIds.length > 0 ? { tagIds: filterTagIds } : undefined
  );

  const total =
    expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) ?? 0;

  return (
    <div className="px-3 xs:px-4 pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Expenses</h1>
        {expenses && (
          <span className="text-sm text-text-muted">
            {formatCurrency(total)} total
          </span>
        )}
      </div>

      {/* Tag filters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">Filter by tag</p>
          {filterTagIds.length > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:text-primary-light transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {tags?.map((tag) => (
            <Badge
              key={tag.id}
              color={tag.color}
              selected={filterTagIds.includes(tag.id)}
              onClick={() => toggleFilterTag(tag.id)}
              className="whitespace-nowrap shrink-0"
            >
              <span>{tag.icon}</span>
              <span>{tag.name}</span>
            </Badge>
          ))}
        </div>
      </div>

      {/* Expense list */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : expenses?.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-text-muted">
            {filterTagIds.length > 0
              ? "No expenses match the selected filters"
              : "No expenses recorded yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses?.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </div>
      )}
    </div>
  );
}
