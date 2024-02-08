import { type PropsWithChildren } from "react";

export declare namespace Cards {
    export type Props = PropsWithChildren;
}

export const Cards: React.FC<Cards.Props> = ({ children }) => {
    return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">{children}</div>;
};
