import { createContext, useContext } from "react";
import { FernDocsFrontmatter } from "../mdx/frontmatter";

const FrontmatterContext = createContext<FernDocsFrontmatter>({});

export const FrontmatterContextProvider = FrontmatterContext.Provider;

export const useFrontmatter = (): FernDocsFrontmatter => {
    return useContext(FrontmatterContext);
};
