"use client";

import { useParams, useRouter } from "next/navigation";
import { useExpenses, useDeleteExpense } from "@/hooks/use-expenses";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: expenses, isLoading } = useExpenses();
  const deleteExpense = useDeleteExpense();
  const [showDelete, setShowDelete] = useState(false);

  const expense = expenses?.find((e) => e.id === id);

  if (isLoading) return <PageLoader />;

  if (!expense) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-text-muted">Expense not found</p>
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteExpense.mutateAsync(expense.id);
    router.push("/expenses");
  };

  return (
    <div className="px-4 pt-6 space-y-5">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-xl p-2 hover:bg-surface-light transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-xl font-bold flex-1">Details</h1>
      </div>

      {/* Store & amount */}
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">{expense.store}</h2>
            <p className="text-sm text-text-muted mt-0.5">
              {formatDate(expense.date)} at {formatTime(expense.date)}
            </p>
          </div>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(expense.amount)}
          </span>
        </div>

        {/* Tags */}
        {expense.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {expense.tags.map((tag) => (
              <Badge key={tag.id} color={tag.color}>
                <span>{tag.icon}</span>
                <span>{tag.name}</span>
              </Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Sub-items */}
      {expense.items.length > 0 && (
        <Card className="space-y-3">
          <h3 className="text-sm font-medium text-text-secondary">Items</h3>
          <div className="space-y-2">
            {expense.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <span className="text-sm text-text-primary">{item.name}</span>
                <span className="text-sm font-medium text-text-secondary">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Notes */}
      {expense.notes && (
        <Card className="space-y-2">
          <h3 className="text-sm font-medium text-text-secondary">Notes</h3>
          <p className="text-sm text-text-primary">{expense.notes}</p>
        </Card>
      )}

      {/* Delete */}
      <Button
        variant="danger"
        className="w-full"
        onClick={() => setShowDelete(true)}
      >
        Delete Expense
      </Button>

      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete Expense"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete this expense from{" "}
            <strong>{expense.store}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowDelete(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              loading={deleteExpense.isPending}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
