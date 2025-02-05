"use client";

import { atom, useAtomValue } from "jotai";

export const versionAtom = atom<string | undefined>(undefined);

export default function IfVersion({
  equals,
  defaultTrue = false,
  children,
}: {
  equals: string;
  defaultTrue?: boolean;
  children: React.ReactNode;
}) {
  const version = useAtomValue(versionAtom);
  return (version === equals || (version == null && defaultTrue)) && children;
}
