import { _CodeBlocks, type CodeBlockItem } from "./_CodeBlocks";

export declare namespace CodeBlocks {
    export interface Props {}
}

function transformCodeBlocksChildrenToItem(children: React.ReactNode & { props: unknown }): CodeBlockItem {
    return {
        children: children.props.children.props.children,
        title: children.props.title ?? " ",
        content: children.props.children.props.children.props.children,
    };
}

export const CodeBlocks: React.FC<React.PropsWithChildren<CodeBlocks.Props>> = ({ children }) => {
    if (Array.isArray(children)) {
        return <_CodeBlocks items={children.map(transformCodeBlocksChildrenToItem)} />;
    } else if (children != null) {
        return (
            <_CodeBlocks
                items={[transformCodeBlocksChildrenToItem(children as React.ReactNode & { props: unknown })]}
            />
        );
    } else {
        return null;
    }
};
