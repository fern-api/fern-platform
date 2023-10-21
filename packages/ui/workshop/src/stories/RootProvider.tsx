import { PropsWithChildren } from "react";

export type RootStylesProviderProps = PropsWithChildren<{
    // ...
}>;

export const RootStylesProvider: React.FC<RootStylesProviderProps> = ({ children }) => {
    return (
        <>
            <style>
                {`
                :root {
                    --typography-code-block-font-family: Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace;
                }
                .typography-font-code-block {
                    font-family: var(--typography-code-block-font-family);
                }
                `}
            </style>
            {children}
        </>
    );
};
