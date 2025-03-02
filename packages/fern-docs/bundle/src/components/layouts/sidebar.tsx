"use client";

import React from "react";

const SidebarTunnelCtx = React.createContext<React.ReactNode>(null);

export function SidebarProvider({
  in: inNode,
  children,
}: {
  in: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <SidebarTunnelCtx.Provider value={inNode}>
      {children}
    </SidebarTunnelCtx.Provider>
  );
}

export function SidebarOut() {
  const inNode = React.useContext(SidebarTunnelCtx);
  return inNode;
}
