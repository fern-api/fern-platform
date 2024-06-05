import { useContext } from "react";
import { DocsContext, DocsContextValue } from "./DocsContext.js";

export function useDocsContext(): DocsContextValue {
    return useContext(DocsContext);
}
