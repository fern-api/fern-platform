import * as FernDocs from "@fern-api/fdr-sdk/docs";
import { createContext, useContext } from "react";

const FrontmatterContext = createContext<FernDocs.Frontmatter>({} as FernDocs.Frontmatter);

export const FrontmatterContextProvider = FrontmatterContext.Provider;

export const useFrontmatter = (): FernDocs.Frontmatter => {
    return useContext(FrontmatterContext);
};
