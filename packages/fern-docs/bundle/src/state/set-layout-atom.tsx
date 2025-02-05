"use client";

import type { Frontmatter } from "@fern-api/fdr-sdk/docs";
import { useHydrateAtoms } from "jotai/utils";
import { layoutAtom } from "./layout-atom";

export default function SetLayoutAtom({
  children,
  layout,
  dangerouslyForceHydrate,
}: {
  children?: React.ReactNode;
  layout: NonNullable<Frontmatter["layout"]>;
  dangerouslyForceHydrate?: boolean;
}) {
  useHydrateAtoms([[layoutAtom, layout]], {
    dangerouslyForceHydrate,
  });

  return children;
}
