"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/loading";
import { useExpenseStore } from "@/stores/expense-store";
import { useTags } from "@/hooks/use-tags";
import { useWittyLoader } from "@/hooks/use-witty-loader";

export function ReceiptUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const { data: tags } = useTags();
  const {
    receiptBase64,
    receiptMimeType,
    isParsing,
    parseError,
    setReceipt,
    setIsParsing,
    setParseError,
    fillFromReceipt,
    setActiveTab,
  } = useExpenseStore();
  const wittyMessage = useWittyLoader();

  const parseReceiptImage = async (base64: string, mimeType: string) => {
    setIsParsing(true);
    setParseError(null);

    try {
      const res = await fetch("/api/parse-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || `Server error (${res.status})`);
      }
      if (!res.ok) throw new Error(data.error || text || `Parse failed (${res.status})`);

      // Map suggested tag names to IDs
      const tagIds =
        tags
          ?.filter((t) =>
            data.suggestedTags?.some(
              (name: string) =>
                name.toLowerCase() === t.name.toLowerCase()
            )
          )
          .map((t) => t.id) ?? [];

      fillFromReceipt({
        store: data.store || "",
        date: data.date || new Date().toISOString(),
        amount: data.amount || 0,
        items: data.items || [],
        tagIds,
      });

      setActiveTab("manual");
    } catch (err) {
      setIsParsing(false);
      setParseError(
        err instanceof Error ? err.message : "Failed to parse receipt"
      );
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      const mimeType = file.type;

      setReceipt(base64, mimeType);
      await parseReceiptImage(base64, mimeType);
    };
    e.target.value = "";
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
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {!receiptBase64 && !isParsing && !parseError && (
        <div className="grid grid-cols-2 gap-3">
          <Card
            className="flex flex-col items-center justify-center gap-3 py-10 border-dashed border-2 cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            <div className="rounded-2xl bg-primary/10 p-3">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-primary">Take Photo</p>
          </Card>
          <Card
            className="flex flex-col items-center justify-center gap-3 py-10 border-dashed border-2 cursor-pointer"
            onClick={() => galleryInputRef.current?.click()}
          >
            <div className="rounded-2xl bg-primary/10 p-3">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21zM8.25 8.625a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-primary">From Gallery</p>
          </Card>
        </div>
      )}

      {isParsing && (
        <Card className="flex flex-col items-center justify-center gap-4 py-16">
          <Spinner className="h-8 w-8" />
          <p className="text-sm font-medium text-primary">
            {wittyMessage}
          </p>
        </Card>
      )}

      {parseError && !isParsing && (
        <Card className="flex flex-col items-center gap-3 p-6 border-destructive/50 bg-destructive/5">
          <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-destructive text-center font-medium">
            Failed to parse receipt
          </p>
          <p className="text-xs text-muted-foreground text-center break-all">
            {parseError}
          </p>
          <div className="flex gap-2 w-full mt-1">
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() => {
                if (receiptBase64 && receiptMimeType) {
                  parseReceiptImage(receiptBase64, receiptMimeType);
                }
              }}
            >
              Retry
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => {
                setParseError(null);
                setActiveTab("manual");
              }}
            >
              Enter Manually
            </Button>
          </div>
        </Card>
      )}

      {receiptBase64 && !isParsing && !parseError && (
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
