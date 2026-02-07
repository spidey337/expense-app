"use client";

import { useSession } from "next-auth/react";
import { useRecentExpenses } from "@/hooks/use-expenses";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { RecentList } from "@/components/dashboard/recent-list";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useTags } from "@/hooks/use-tags";
import { PageLoader } from "@/components/ui/loading";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { data: expenses, isLoading } = useRecentExpenses();
  const { data: tags } = useTags();

  if (status === "loading") return <PageLoader />;

  // Calculate spending per tag
  const tagSpending = new Map<string, number>();
  expenses?.forEach((expense) => {
    expense.tags.forEach((tag) => {
      tagSpending.set(
        tag.id,
        (tagSpending.get(tag.id) ?? 0) + parseFloat(expense.amount)
      );
    });
  });

  const sortedTagSpending = Array.from(tagSpending.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="space-y-6 px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-text-muted">Welcome back</p>
          <h1 className="text-xl font-bold">
            {session?.user?.name?.split(" ")[0] ?? "Dashboard"}
          </h1>
        </div>
        {session?.user?.image && (
          <img
            src={session.user.image}
            alt=""
            className="h-10 w-10 rounded-full border-2 border-border"
          />
        )}
      </div>

      {/* Summary Cards */}
      <SummaryCards expenses={expenses} isLoading={isLoading} />

      {/* Spending Chart */}
      <SpendingChart expenses={expenses} isLoading={isLoading} />

      {/* Top Categories */}
      {sortedTagSpending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-text-secondary">
            Top Categories
          </h3>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {sortedTagSpending.map(([tagId, amount]) => {
              const tag = tags?.find((t) => t.id === tagId);
              if (!tag) return null;
              return (
                <Badge key={tagId} color={tag.color} className="whitespace-nowrap shrink-0">
                  <span>{tag.icon}</span>
                  <span>{tag.name}</span>
                  <span className="ml-1 opacity-75">
                    {formatCurrency(amount)}
                  </span>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Expenses */}
      <RecentList expenses={expenses} isLoading={isLoading} />
    </div>
  );
}
