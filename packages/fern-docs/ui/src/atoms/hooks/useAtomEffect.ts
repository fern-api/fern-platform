import { useAtomValue } from "jotai";
import { atomEffect } from "jotai-effect";
import { useMemoOne as useStableMemo } from "use-memo-one";

type EffectFn = Parameters<typeof atomEffect>[0];

export function useAtomEffect(effectFn: EffectFn): void {
  useAtomValue(useStableMemo(() => atomEffect(effectFn), [effectFn]));
}
