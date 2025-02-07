"use client";

export function GlobalStyles({ children }: { children: string }) {
  return (
    <style jsx global>
      {children}
    </style>
  );
}
