"use client";

import { template } from "es-toolkit/compat";
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

export function applyTemplates(code: string, data?: Record<string, string>) {
  if (!data || Object.keys(data).length === 0) {
    return code;
  }

  try {
    return template(code, { interpolate: /{{([^}]+)}}/g })(data);
  } catch (error) {
    console.error(error);
    return code;
  }
}
