import { createContext, useContext } from "react";

import * as FernDocs from "@fern-api/fdr-sdk/docs";

const FrontmatterContext = createContext<FernDocs.Frontmatter>(
  {} as FernDocs.Frontmatter
);

export const FrontmatterContextProvider = FrontmatterContext.Provider;

export const useFrontmatter = (): FernDocs.Frontmatter => {
  return useContext(FrontmatterContext);
};
