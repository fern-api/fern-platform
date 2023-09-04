import { type PropsWithChildren } from "react";

export declare namespace Cards {
    export type Props = PropsWithChildren;
}

export const Cards: React.FC<Cards.Props> = ({ children }) => {
    return <div className="flex flex-wrap gap-6">{children}</div>;
};
