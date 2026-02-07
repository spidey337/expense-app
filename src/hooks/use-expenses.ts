import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ExpenseWithDetails {
  id: string;
  store: string;
  amount: string;
  date: string;
  receiptUrl: string | null;
  notes: string | null;
  paymentMethod: string | null;
  createdAt: string;
  items: { id: string; name: string; amount: string }[];
  tags: { id: string; name: string; color: string; icon: string }[];
}

interface CreateExpensePayload {
  store: string;
  amount: string;
  date: string;
  notes?: string;
  paymentMethod?: string;
  tagIds: string[];
  items: { name: string; amount: string }[];
}

interface FetchExpensesParams {
  tagIds?: string[];
  from?: string;
  to?: string;
}

async function fetchExpenses(params?: FetchExpensesParams): Promise<ExpenseWithDetails[]> {
  const searchParams = new URLSearchParams();
  if (params?.tagIds?.length) searchParams.set("tagIds", params.tagIds.join(","));
  if (params?.from) searchParams.set("from", params.from);
  if (params?.to) searchParams.set("to", params.to);

  const res = await fetch(`/api/expenses?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch expenses");
  return res.json();
}

async function createExpense(payload: CreateExpensePayload): Promise<ExpenseWithDetails> {
  const res = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create expense");
  }
  return res.json();
}

async function deleteExpense(id: string): Promise<void> {
  const res = await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete expense");
}

export function useExpenses(params?: FetchExpensesParams) {
  return useQuery({
    queryKey: ["expenses", params],
    queryFn: () => fetchExpenses(params),
  });
}

export function useRecentExpenses() {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  twoWeeksAgo.setHours(0, 0, 0, 0);

  return useExpenses({ from: twoWeeksAgo.toISOString() });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}
