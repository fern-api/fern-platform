"use client";

export default function GlobalStyle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <style jsx global>
      {children}
    </style>
  );
}
