import { transformCodeBlocksChildrenToCodeBlockItem } from "./common/util";
import { _CodeBlocks } from "./_CodeBlocks";

export declare namespace CodeBlocks {
    export interface Props {
        children: unknown;
    }
}

export const CodeBlocks: React.FC<React.PropsWithChildren<CodeBlocks.Props>> = ({ children }) => {
    return <_CodeBlocks items={transformCodeBlocksChildrenToCodeBlockItem(children)} />;
};
