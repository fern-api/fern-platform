"use client";

import { Provider, createStore } from "jotai";

export const jotaiStore: ReturnType<typeof createStore> = createStore();

export function JotaiProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={jotaiStore}>{children}</Provider>;
}
