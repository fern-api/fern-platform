import type { EdgeFlags } from "@fern-docs/utils";
import { isEqual } from "es-toolkit/predicate";
import { atom, useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { useMemoOne } from "use-memo-one";
import { DOCS_ATOM } from "./docs";

export const EDGE_FLAGS_ATOM = selectAtom(
  DOCS_ATOM,
  (docs) => docs.edgeFlags,
  isEqual
);
EDGE_FLAGS_ATOM.debugLabel = "EDGE_FLAGS_ATOM";

export function useEdgeFlags(): EdgeFlags {
  return useAtomValue(EDGE_FLAGS_ATOM);
}

export function useEdgeFlag(flag: keyof EdgeFlags): boolean {
  return useAtomValue(
    useMemoOne(() => atom((get) => !!get(EDGE_FLAGS_ATOM)[flag]), [flag])
  );
}
