"use client";

import { useState, useEffect, useMemo } from "react";

const messages = [
  "Accessing the mainframe...",
  "Aligning the stars...",
  "Hiring a receipt reader...",
  "Consulting the finance gods...",
  "Decoding ancient symbols...",
  "Bribing the AI...",
  "Summoning the spreadsheet wizard...",
  "Counting pixels...",
  "Translating chicken scratch...",
  "Asking nicely...",
  "Enhancing... enhancing...",
  "Crunching the numbers...",
  "Warming up the abacus...",
  "Teaching AI to read...",
  "Channeling inner accountant...",
];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function useWittyLoader() {
  const shuffled = useMemo(() => shuffle(messages), []);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % shuffled.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [shuffled.length]);

  return shuffled[index];
}
