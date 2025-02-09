"use client";

import { createContext, useContext } from "react";

export const WithAside = createContext<boolean>(false);

export function useWithAside(): boolean {
  return useContext(WithAside);
}
