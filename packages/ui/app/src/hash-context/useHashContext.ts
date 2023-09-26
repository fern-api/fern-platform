import { useContext } from "react";
import { HashContext, type HashContextValue } from "./HashContext";

export function useHashContext(): HashContextValue {
    return useContext(HashContext)();
}
