"use client";

export default function GlobalStyle({ children }: { children: string }) {
  return (
    <style jsx global>
      {children}
    </style>
  );
}
