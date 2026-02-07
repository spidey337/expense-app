"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency, getDaysArray, getStartOfDay, getTwoWeeksAgo } from "@/lib/utils";
import type { ExpenseWithDetails } from "@/hooks/use-expenses";
import { useState } from "react";

interface SpendingChartProps {
  expenses: ExpenseWithDetails[] | undefined;
  isLoading: boolean;
}

export function SpendingChart({ expenses, isLoading }: SpendingChartProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card className="space-y-3">
        <div className="skeleton h-4 w-32 rounded" />
        <div className="flex items-end gap-1 h-28">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="skeleton flex-1 rounded-t"
              style={{ height: `${20 + Math.random() * 80}%` }}
            />
          ))}
        </div>
      </Card>
    );
  }

  const days = getDaysArray(getTwoWeeksAgo(), new Date());

  // Aggregate spending by day
  const dailyTotals = days.map((day) => {
    const dayStr = day.toISOString().slice(0, 10);
    const dayExpenses =
      expenses?.filter(
        (e) => new Date(e.date).toISOString().slice(0, 10) === dayStr
      ) ?? [];
    const total = dayExpenses.reduce(
      (sum, e) => sum + parseFloat(e.amount),
      0
    );
    return { date: day, dayStr, total, count: dayExpenses.length };
  });

  const maxTotal = Math.max(...dailyTotals.map((d) => d.total), 1);

  const selectedData = selectedDay
    ? dailyTotals.find((d) => d.dayStr === selectedDay)
    : null;

  const weekdayFormat = new Intl.DateTimeFormat("en-US", { weekday: "narrow" });
  const dayFormat = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-secondary">
          Daily Spending
        </h3>
        {selectedData && (
          <div className="text-right">
            <p className="text-xs text-text-muted">
              {dayFormat.format(selectedData.date)}
            </p>
            <p className="text-sm font-bold text-primary">
              {formatCurrency(selectedData.total)}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-end gap-[3px] h-28">
        {dailyTotals.map((day) => {
          const height = day.total > 0 ? Math.max((day.total / maxTotal) * 100, 4) : 2;
          const isSelected = selectedDay === day.dayStr;
          const isToday =
            day.dayStr === new Date().toISOString().slice(0, 10);

          return (
            <button
              key={day.dayStr}
              className="flex-1 flex flex-col items-center gap-1 group min-h-[44px] justify-end"
              onClick={() =>
                setSelectedDay(isSelected ? null : day.dayStr)
              }
            >
              <div
                className={`w-full rounded-t-sm transition-all duration-200 ${
                  isSelected
                    ? "bg-primary"
                    : isToday
                      ? "bg-primary/60"
                      : day.total > 0
                        ? "bg-primary/30 group-hover:bg-primary/50"
                        : "bg-border"
                }`}
                style={{ height: `${height}%` }}
              />
              <span className="text-[8px] text-text-muted">
                {weekdayFormat.format(day.date)}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
