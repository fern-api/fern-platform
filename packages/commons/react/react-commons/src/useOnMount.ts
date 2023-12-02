import { EffectCallback, useEffect } from "react";

export function useOnMount(callback: EffectCallback): void {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useEffect(() => callback(), []);
}
