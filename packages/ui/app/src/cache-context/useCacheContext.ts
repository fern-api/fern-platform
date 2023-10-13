import { useContext } from "react";
import { CacheContext, CacheContextValue } from "./CacheContext";

export function useCacheContext(): CacheContextValue {
    return useContext(CacheContext)();
}
