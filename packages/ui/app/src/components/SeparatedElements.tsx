import { ReactElement } from "react";

export declare namespace SeparatedElements {
    export interface Props {
        separator: ReactElement;
        children: (ReactElement | null)[];
    }
}

export const SeparatedElements: React.FC<SeparatedElements.Props> = ({ separator, children }) => {
    return children.reduce((acc, child) => {
        if (acc == null) {
            return child;
        }
        if (child == null) {
            return acc;
        }
        return (
            <>
                {acc}
                {separator}
                {child}
            </>
        );
    }, null);
};
