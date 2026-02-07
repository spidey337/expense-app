"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import type { ExpenseWithDetails } from "@/hooks/use-expenses";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
} from "react";

// ── Types ───────────────────────────────────────────────

type Mode = "weekly" | "monthly";

interface DayData {
  date: Date;
  dayStr: string;
  total: number;
  count: number;
  expenses: ExpenseWithDetails[];
  isToday: boolean;
}

interface MonthData {
  key: string;
  label: string;
  shortLabel: string;
  date: Date;
  total: number;
  count: number;
  expenses: ExpenseWithDetails[];
  isCurrent: boolean;
}

interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  count: number;
}

// ── Helpers ─────────────────────────────────────────────

const dayFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const monthFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const WEEKDAY = ["S", "M", "T", "W", "T", "F", "S"];

function daysArray(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (cur <= last) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

async function fetchChartExpenses(
  from: string,
  to: string
): Promise<ExpenseWithDetails[]> {
  const params = new URLSearchParams({ from, to });
  const res = await fetch(`/api/expenses?${params}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

function getBreakdown(expenses: ExpenseWithDetails[]): CategoryItem[] {
  const map = new Map<string, CategoryItem>();
  for (const e of expenses) {
    const amt = parseFloat(e.amount);
    if (e.tags.length === 0) {
      const prev = map.get("_none");
      if (prev) {
        prev.total += amt;
        prev.count++;
      } else {
        map.set("_none", {
          id: "_none",
          name: "Uncategorized",
          icon: "📋",
          color: "#64748b",
          total: amt,
          count: 1,
        });
      }
    } else {
      for (const t of e.tags) {
        const prev = map.get(t.id);
        if (prev) {
          prev.total += amt;
          prev.count++;
        } else {
          map.set(t.id, {
            id: t.id,
            name: t.name,
            icon: t.icon,
            color: t.color,
            total: amt,
            count: 1,
          });
        }
      }
    }
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

// ── Component ───────────────────────────────────────────

export function SpendingChart() {
  const [mode, setMode] = useState<Mode>("weekly");
  const [periods, setPeriods] = useState(3);
  const [selected, setSelected] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const didInitScroll = useRef(false);
  const prevScrollWidth = useRef(0);
  const isLoadingMore = useRef(false);

  // Stable "now" for the session
  const now = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);

  const from = useMemo(() => {
    const d = new Date(now);
    if (mode === "weekly") d.setDate(d.getDate() - periods * 7);
    else d.setMonth(d.getMonth() - periods);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [now, mode, periods]);

  const { data: expenses, isLoading, isFetching } = useQuery({
    queryKey: ["chart-expenses", from.toISOString(), now.toISOString()],
    queryFn: () => fetchChartExpenses(from.toISOString(), now.toISOString()),
    placeholderData: keepPreviousData,
  });

  const todayStr = new Date().toISOString().slice(0, 10);

  // Build per-day data
  const daily: DayData[] = useMemo(() => {
    const days = daysArray(from, now);
    return days.map((d) => {
      const s = d.toISOString().slice(0, 10);
      const matched = (expenses ?? []).filter(
        (e) => new Date(e.date).toISOString().slice(0, 10) === s
      );
      return {
        date: d,
        dayStr: s,
        total: matched.reduce((a, e) => a + parseFloat(e.amount), 0),
        count: matched.length,
        expenses: matched,
        isToday: s === todayStr,
      };
    });
  }, [expenses, from, now, todayStr]);

  // Weekly: group days into weeks for visual separators
  const weekGroups = useMemo(() => {
    if (mode !== "weekly") return [];
    const g: { key: string; label: string; days: DayData[] }[] = [];
    let curKey = "";
    for (const d of daily) {
      const ws = new Date(d.date);
      ws.setDate(ws.getDate() - ws.getDay());
      const key = ws.toISOString().slice(0, 10);
      if (key !== curKey) {
        g.push({ key, label: dayFmt.format(ws), days: [] });
        curKey = key;
      }
      g[g.length - 1].days.push(d);
    }
    return g;
  }, [daily, mode]);

  // Monthly: consolidate all expenses per month into single bars
  const nowMonth = `${now.getFullYear()}-${now.getMonth()}`;
  const monthly: MonthData[] = useMemo(() => {
    if (mode !== "monthly") return [];
    const map = new Map<string, MonthData>();
    for (const d of daily) {
      const key = `${d.date.getFullYear()}-${d.date.getMonth()}`;
      const existing = map.get(key);
      if (existing) {
        existing.total += d.total;
        existing.count += d.count;
        existing.expenses.push(...d.expenses);
      } else {
        map.set(key, {
          key,
          label: d.date.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
          shortLabel: d.date.toLocaleDateString("en-US", { month: "short" }),
          date: new Date(d.date.getFullYear(), d.date.getMonth(), 1),
          total: d.total,
          count: d.count,
          expenses: [...d.expenses],
          isCurrent: key === nowMonth,
        });
      }
    }
    return [...map.values()];
  }, [daily, mode, nowMonth]);

  const maxTotal = useMemo(
    () =>
      mode === "weekly"
        ? Math.max(...daily.map((d) => d.total), 1)
        : Math.max(...monthly.map((m) => m.total), 1),
    [daily, monthly, mode]
  );

  // ── Scroll: detect left edge, debounced ──
  const onScroll = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const el = scrollRef.current;
      if (!el || isFetching) return;
      if (el.scrollLeft < 50) {
        prevScrollWidth.current = el.scrollWidth;
        isLoadingMore.current = true;
        setPeriods((p) => p + (mode === "weekly" ? 2 : 3));
      }
    }, 200);
  }, [isFetching, mode]);

  // Restore scroll position after prepending data (before paint)
  useLayoutEffect(() => {
    if (!isLoadingMore.current || isFetching) return;
    const el = scrollRef.current;
    if (el) {
      const added = el.scrollWidth - prevScrollWidth.current;
      if (added > 0) el.scrollLeft += added;
    }
    isLoadingMore.current = false;
  }, [daily, isFetching]);

  // Initial scroll to rightmost (most recent)
  useEffect(() => {
    if (!isLoading && !didInitScroll.current && scrollRef.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
      });
      didInitScroll.current = true;
    }
  }, [isLoading, daily]);

  // Reset on mode change
  useEffect(() => {
    setPeriods(mode === "weekly" ? 3 : 6);
    setSelected(null);
    didInitScroll.current = false;
  }, [mode]);

  // Selected bar data (day in weekly, month in monthly)
  const selDay = useMemo(
    () =>
      mode === "weekly" && selected
        ? daily.find((d) => d.dayStr === selected)
        : null,
    [selected, daily, mode]
  );
  const selMonth = useMemo(
    () =>
      mode === "monthly" && selected
        ? monthly.find((m) => m.key === selected)
        : null,
    [selected, monthly, mode]
  );
  const selExpenses = selDay?.expenses ?? selMonth?.expenses ?? [];
  const selTotal = selDay?.total ?? selMonth?.total ?? 0;
  const selCount = selDay?.count ?? selMonth?.count ?? 0;
  const selLabel = selDay
    ? dayFmt.format(selDay.date)
    : selMonth
      ? monthFmt.format(selMonth.date)
      : "";
  const hasSelection = !!(selDay || selMonth);
  const cats = useMemo(
    () => (selExpenses.length > 0 ? getBreakdown(selExpenses) : []),
    [selExpenses]
  );

  // ── Render ──

  if (isLoading) {
    return (
      <Card className="space-y-3">
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-40 rounded" />
      </Card>
    );
  }

  const bw = mode === "weekly" ? 34 : 52;
  const gap = mode === "weekly" ? 3 : 6;
  const groupGap = 10;

  return (
    <Card className="space-y-2">
      {/* Header + W/M toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-secondary">Spending</h3>
        <div className="flex bg-surface-light rounded-lg p-0.5 text-xs">
          {(["weekly", "monthly"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-2.5 py-1 rounded-md transition-colors",
                mode === m
                  ? "bg-primary text-white"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              {m === "weekly" ? "W" : "M"}
            </button>
          ))}
        </div>
      </div>

      {/* Selected bar mini-summary */}
      {hasSelection && (
        <div className="flex items-center justify-between text-xs animate-in">
          <span className="text-text-muted">{selLabel}</span>
          <span className="font-bold text-primary-light">
            {formatCurrency(selTotal)}
            <span className="text-text-muted font-normal ml-1">
              · {selCount} expense{selCount !== 1 ? "s" : ""}
            </span>
          </span>
        </div>
      )}

      {/* Scrollable bar chart */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="overflow-x-auto scrollbar-hide -mx-4 px-4"
      >
        <div className="flex items-end" style={{ minHeight: 148 }}>
          {/* Loading spinner at left edge */}
          {isLoadingMore.current && isFetching && (
            <div className="flex items-center justify-center w-8 shrink-0 self-center">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* ── Weekly: per-day bars grouped by week ── */}
          {mode === "weekly" &&
            weekGroups.map((g, gi) => (
              <div
                key={g.key}
                className="flex flex-col shrink-0"
                style={{
                  marginRight: gi < weekGroups.length - 1 ? groupGap : 0,
                }}
              >
                <div
                  className="text-[10px] text-text-muted mb-1 truncate"
                  style={{ maxWidth: g.days.length * (bw + gap) }}
                >
                  {g.label}
                </div>
                <div className="flex items-end" style={{ height: 110 }}>
                  {g.days.map((d) => {
                    const pct =
                      maxTotal > 0 ? (d.total / maxTotal) * 100 : 0;
                    const isSel = selected === d.dayStr;
                    return (
                      <div
                        key={d.dayStr}
                        className="flex flex-col items-center shrink-0"
                        style={{ width: bw, marginRight: gap }}
                      >
                        <div
                          className="w-full flex items-end justify-center cursor-pointer active:opacity-70"
                          style={{ height: 90 }}
                          onClick={() =>
                            setSelected((p) =>
                              p === d.dayStr ? null : d.dayStr
                            )
                          }
                        >
                          <div
                            className={cn(
                              "w-full rounded-t transition-all duration-150",
                              isSel &&
                                "ring-1 ring-primary-light ring-offset-1 ring-offset-surface"
                            )}
                            style={{
                              height: `${Math.max(pct, d.total > 0 ? 6 : 3)}%`,
                              minHeight: 3,
                              backgroundColor: isSel
                                ? "#818cf8"
                                : d.isToday
                                  ? "#6366f1"
                                  : d.total > 0
                                    ? "#a78bfa"
                                    : "rgba(100,116,139,0.2)",
                            }}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-[9px] mt-1 leading-none select-none",
                            isSel
                              ? "text-primary-light font-bold"
                              : d.isToday
                                ? "text-primary font-medium"
                                : "text-text-muted"
                          )}
                        >
                          {WEEKDAY[d.date.getDay()]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

          {/* ── Monthly: one consolidated bar per month ── */}
          {mode === "monthly" &&
            monthly.map((m) => {
              const pct =
                maxTotal > 0 ? (m.total / maxTotal) * 100 : 0;
              const isSel = selected === m.key;
              return (
                <div
                  key={m.key}
                  className="flex flex-col items-center shrink-0"
                  style={{ width: bw, marginRight: gap }}
                >
                  <div
                    className="w-full flex items-end justify-center cursor-pointer active:opacity-70"
                    style={{ height: 110 }}
                    onClick={() =>
                      setSelected((p) => (p === m.key ? null : m.key))
                    }
                  >
                    <div
                      className={cn(
                        "w-full rounded-t transition-all duration-150",
                        isSel &&
                          "ring-1 ring-primary-light ring-offset-1 ring-offset-surface"
                      )}
                      style={{
                        height: `${Math.max(pct, m.total > 0 ? 6 : 3)}%`,
                        minHeight: 3,
                        backgroundColor: isSel
                          ? "#818cf8"
                          : m.isCurrent
                            ? "#6366f1"
                            : m.total > 0
                              ? "#a78bfa"
                              : "rgba(100,116,139,0.2)",
                      }}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] mt-1.5 leading-none select-none",
                      isSel
                        ? "text-primary-light font-bold"
                        : m.isCurrent
                          ? "text-primary font-medium"
                          : "text-text-muted"
                    )}
                  >
                    {m.shortLabel}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Category breakdown on tap */}
      {hasSelection && cats.length > 0 && (
        <div className="space-y-2 border-t border-border pt-3 mt-1">
          <h4 className="text-xs font-medium text-text-muted">
            {selLabel} — Breakdown
          </h4>
          <div className="space-y-2">
            {cats.map((c) => {
              const pct =
                selTotal > 0 ? (c.total / selTotal) * 100 : 0;
              return (
                <div key={c.id} className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-5 text-center shrink-0">
                      {c.icon}
                    </span>
                    <span className="flex-1 text-text-secondary truncate">
                      {c.name}
                    </span>
                    <span className="text-text-muted shrink-0">
                      {c.count}×
                    </span>
                    <span className="font-medium text-text-primary min-w-[72px] text-right shrink-0">
                      {formatCurrency(c.total)}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-surface-light ml-7">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: c.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
