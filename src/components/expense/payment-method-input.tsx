"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = ["Cash", "Card", "GCash", "Maya"];

interface PaymentMethodInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function PaymentMethodInput({ value, onChange }: PaymentMethodInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = SUGGESTIONS.filter(
    (s) => !value || s.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="space-y-1.5">
      <label
        htmlFor="paymentMethod"
        className="block text-sm font-medium text-text-secondary"
      >
        Payment Method
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id="paymentMethod"
          type="text"
          placeholder='e.g. Card (BPI 3082)'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          autoComplete="off"
          className={cn(
            "w-full rounded-xl border bg-surface px-4 py-3 text-sm text-text-primary",
            "placeholder:text-text-muted",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
            "transition-all duration-150",
            "min-h-[44px]",
            "border-border"
          )}
        />
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-surface shadow-lg overflow-hidden">
            {filtered.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="w-full px-4 py-2.5 text-sm text-left text-text-primary hover:bg-surface-light transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(suggestion);
                  setShowSuggestions(false);
                  inputRef.current?.focus();
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
