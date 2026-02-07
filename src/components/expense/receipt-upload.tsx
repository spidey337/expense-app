"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/loading";
import { useExpenseStore } from "@/stores/expense-store";
import { useTags } from "@/hooks/use-tags";

export function ReceiptUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: tags } = useTags();
  const {
    receiptBase64,
    receiptMimeType,
    isParsing,
    setReceipt,
    setIsParsing,
    fillFromReceipt,
    setActiveTab,
  } = useExpenseStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      const mimeType = file.type;

      setReceipt(base64, mimeType);
      setIsParsing(true);

      try {
        const res = await fetch("/api/parse-receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, mimeType }),
        });

        if (!res.ok) throw new Error("Parse failed");

        const parsed = await res.json();

        // Map suggested tag names to IDs
        const tagIds =
          tags
            ?.filter((t) =>
              parsed.suggestedTags?.some(
                (name: string) =>
                  name.toLowerCase() === t.name.toLowerCase()
              )
            )
            .map((t) => t.id) ?? [];

        fillFromReceipt({
          store: parsed.store || "",
          date: parsed.date || new Date().toISOString(),
          amount: parsed.amount || 0,
          items: parsed.items || [],
          tagIds,
        });

        setActiveTab("manual");
      } catch {
        setIsParsing(false);
        alert("Failed to parse receipt. Please try again or enter manually.");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {!receiptBase64 && !isParsing && (
        <Card
          className="flex flex-col items-center justify-center gap-4 py-16 border-dashed border-2 cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <div className="rounded-2xl bg-primary/10 p-4">
            <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary">
              Scan Receipt
            </p>
            <p className="text-xs text-text-muted mt-1">
              Take a photo or upload an image
            </p>
          </div>
        </Card>
      )}

      {isParsing && (
        <Card className="flex flex-col items-center justify-center gap-4 py-16">
          <Spinner className="h-8 w-8" />
          <div className="text-center">
            <p className="text-sm font-medium text-primary">
              Analyzing receipt...
            </p>
            <p className="text-xs text-text-muted mt-1">
              AI is extracting details from your receipt
            </p>
          </div>
        </Card>
      )}

      {receiptBase64 && !isParsing && (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-border">
            <img
              src={`data:${receiptMimeType};base64,${receiptBase64}`}
              alt="Receipt"
              className="w-full max-h-48 object-cover"
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => {
              setReceipt(null, null);
              inputRef.current?.click();
            }}
          >
            Upload different receipt
          </Button>
        </div>
      )}
    </div>
  );
}
