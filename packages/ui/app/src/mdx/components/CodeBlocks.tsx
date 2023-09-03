import classNames from "classnames";
import { useState } from "react";
import { CodeBlockCore } from "../base-components";

interface CodeBlockItem {
    children: React.ReactNode;
    title: string;
}

export declare namespace CodeBlocks {
    export interface Props {}
}

export const CodeBlocks: React.FC<React.PropsWithChildren<CodeBlocks.Props>> = ({ children }) => {
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);

    if (!Array.isArray(children)) {
        return null;
    }

    const codeBlockItems: CodeBlockItem[] = children.map((c) => ({
        children: c.props.children.props.children,
        title: c.props.title ?? " ",
    }));

    const codeBlockItem = codeBlockItems[selectedTabIndex];

    if (codeBlockItem == null) {
        return null;
    }

    return (
        <div>
            <div className="border-border-default-light dark:border-border-default-dark bg-background-tertiary-light dark:bg-background-tertiary-dark flex overflow-x-scroll rounded-t-lg border">
                {codeBlockItems.map((item, idx) => (
                    <button
                        className={classNames("border-b py-2 px-4 transition text-xs", {
                            "text-accent-primary border-accent-primary": selectedTabIndex === idx,
                            "t-muted border-transparent hover:text-text-primary-light hover:dark:text-text-primary-dark":
                                selectedTabIndex !== idx,
                        })}
                        key={idx}
                        onClick={() => setSelectedTabIndex(idx)}
                    >
                        {item.title}
                    </button>
                ))}
            </div>
            <CodeBlockCore>{codeBlockItem.children}</CodeBlockCore>
        </div>
    );
};
