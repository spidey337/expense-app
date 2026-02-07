"use client";

import { cn } from "@/lib/utils";
import { ExpenseForm } from "@/components/expense/expense-form";
import { ReceiptUpload } from "@/components/expense/receipt-upload";
import { useExpenseStore } from "@/stores/expense-store";

export default function AddExpensePage() {
  const { activeTab, setActiveTab } = useExpenseStore();

  return (
    <div className="px-3 xs:px-4 pt-6 space-y-5">
      <h1 className="text-xl font-bold">Add Expense</h1>

      {/* Tab switcher */}
      <div className="flex rounded-xl bg-surface border border-border p-1">
        <button
          onClick={() => setActiveTab("manual")}
          className={cn(
            "flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px]",
            activeTab === "manual"
              ? "bg-primary text-white shadow-md"
              : "text-text-muted hover:text-text-secondary"
          )}
        >
          Manual Entry
        </button>
        <button
          onClick={() => setActiveTab("receipt")}
          className={cn(
            "flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 min-h-[44px]",
            activeTab === "receipt"
              ? "bg-primary text-white shadow-md"
              : "text-text-muted hover:text-text-secondary"
          )}
        >
          Scan Receipt
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "manual" ? <ExpenseForm /> : <ReceiptUpload />}
    </div>
  );
}
