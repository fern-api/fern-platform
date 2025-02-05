"use client";

import { atom, useAtomValue } from "jotai";

export const productAtom = atom<string | undefined>(undefined);

export default function IfProduct({
  equals,
  defaultTrue = false,
  children,
}: {
  equals: string;
  defaultTrue?: boolean;
  children: React.ReactNode;
}) {
  const product = useAtomValue(productAtom);
  return (product === equals || (product == null && defaultTrue)) && children;
}
