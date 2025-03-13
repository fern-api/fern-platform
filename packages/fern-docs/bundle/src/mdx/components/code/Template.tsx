"use client";

import React from "react";

import { template } from "es-toolkit/compat";

const TemplateCtx = React.createContext<{
  template: Record<string, string>;
  tooltips: Record<string, React.ReactNode>;
}>({
  template: {},
  tooltips: {},
});

/**
 * provides templates to the code block component
 */
export function Template({
  children,
  data,
  tooltips,
}: {
  children: React.ReactNode;
  data?: Record<string, string>;
  tooltips?: Record<string, React.ReactNode>;
}) {
  return (
    <TemplateCtx.Provider
      value={{ template: data ?? {}, tooltips: tooltips ?? {} }}
    >
      {children}
    </TemplateCtx.Provider>
  );
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
