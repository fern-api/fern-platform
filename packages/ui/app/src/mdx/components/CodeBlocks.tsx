import { transformCodeBlocksChildrenToCodeBlockItem } from "./common/util";
import { _CodeBlocks } from "./_CodeBlocks";

export declare namespace CodeBlocks {
    export interface Props {
        children: unknown;
    }
}

export const CodeBlocks: React.FC<React.PropsWithChildren<CodeBlocks.Props>> = ({ children }) => {
    if (Array.isArray(children)) {
        return <_CodeBlocks items={children.map(transformCodeBlocksChildrenToCodeBlockItem)} />;
    } else if (children != null) {
        return <_CodeBlocks items={[transformCodeBlocksChildrenToCodeBlockItem(children)]} />;
    } else {
        return null;
    }
};
