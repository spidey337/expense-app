"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SubItem {
  name: string;
  amount: string;
}

interface SubItemsProps {
  items: SubItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: "name" | "amount", value: string) => void;
}

export function SubItems({ items, onAdd, onRemove, onUpdate }: SubItemsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-text-secondary">
          Items
        </label>
        <Button variant="ghost" size="sm" onClick={onAdd} type="button">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add item
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1">
              <Input
                placeholder="Item name"
                value={item.name}
                onChange={(e) => onUpdate(index, "name", e.target.value)}
              />
            </div>
            <div className="w-28">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={item.amount}
                onChange={(e) => onUpdate(index, "amount", e.target.value)}
              />
            </div>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="mt-2 rounded-lg p-2 text-text-muted hover:text-danger hover:bg-danger/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
