"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TagSelector } from "./tag-selector";
import { SubItems } from "./sub-items";
import { PaymentMethodInput } from "./payment-method-input";
import { useExpenseStore } from "@/stores/expense-store";
import { useCreateExpense } from "@/hooks/use-expenses";
import { useRouter } from "next/navigation";

export function ExpenseForm() {
  const router = useRouter();
  const createExpense = useCreateExpense();
  const {
    store,
    date,
    amount,
    notes,
    paymentMethod,
    selectedTagIds,
    items,
    setStore,
    setDate,
    setAmount,
    setNotes,
    setPaymentMethod,
    toggleTag,
    addItem,
    removeItem,
    updateItem,
    resetForm,
  } = useExpenseStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!store.trim() || !amount || !date) return;

    try {
      await createExpense.mutateAsync({
        store: store.trim(),
        amount,
        date: new Date(date).toISOString(),
        notes: notes.trim() || undefined,
        paymentMethod: paymentMethod.trim() || undefined,
        tagIds: selectedTagIds,
        items: items.filter((item) => item.name.trim() && item.amount),
      });

      resetForm();
      router.push("/");
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        id="store"
        label="Store / Business"
        placeholder="Where did you spend?"
        value={store}
        onChange={(e) => setStore(e.target.value)}
        required
      />

      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
        <Input
          id="amount"
          label="Total Amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Input
          id="date"
          label="Date & Time"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <TagSelector selectedIds={selectedTagIds} onToggle={toggleTag} />

      <PaymentMethodInput value={paymentMethod} onChange={setPaymentMethod} />

      <SubItems
        items={items}
        onAdd={addItem}
        onRemove={removeItem}
        onUpdate={updateItem}
      />

      <Input
        id="notes"
        label="Notes (optional)"
        placeholder="Any additional notes..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={createExpense.isPending}
        disabled={!store.trim() || !amount || !date}
      >
        Save Expense
      </Button>

      {createExpense.isError && (
        <p className="text-sm text-danger text-center">
          {createExpense.error.message}
        </p>
      )}
    </form>
  );
}
