"use client";

import React from "react";

const TypeDefinitionSlots = React.createContext<
  Record<string, React.ReactNode>
>({});

export function TypeDefinitionSlotsProvider({
  slots,
  children,
}: {
  slots: Record<string, React.ReactNode>;
  children: React.ReactNode;
}) {
  return (
    <TypeDefinitionSlots.Provider value={slots}>
      {children}
    </TypeDefinitionSlots.Provider>
  );
}

export function useTypeDefinitionSlots(id: string) {
  return React.useContext(TypeDefinitionSlots)[id];
}

export function TypeDefinitionSlot({ id }: { id: string }) {
  return useTypeDefinitionSlots(id);
}
