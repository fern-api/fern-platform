import { _CodeBlocks } from "./_CodeBlocks";

export declare namespace CodeBlocks {
    export interface Props {}
}

export const CodeBlocks: React.FC<React.PropsWithChildren<CodeBlocks.Props>> = ({ children }) => {
    if (!Array.isArray(children)) {
        return null;
    }
    return (
        <_CodeBlocks
            items={children.map((c) => ({
                children: c.props.children.props.children,
                title: c.props.title ?? " ",
                content: c.props.children.props.children.props.children,
            }))}
        />
    );
};
