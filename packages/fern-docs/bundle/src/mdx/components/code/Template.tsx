"use client";

import React from "react";

const TemplateCtx = React.createContext<Record<string, string>>({});

/**
 * provides templates to the code block component
 */
export function Template({
  children,
  data,
}: {
  children: React.ReactNode;
  data: Record<string, string>;
}) {
  return <TemplateCtx.Provider value={data}>{children}</TemplateCtx.Provider>;
}

export function useTemplate() {
  return React.useContext(TemplateCtx);
}
