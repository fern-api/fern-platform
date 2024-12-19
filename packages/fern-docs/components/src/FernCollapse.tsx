import * as Collapsible from "@radix-ui/react-collapsible";
import { FC, PropsWithChildren, ReactNode } from "react";

interface FernCollapseProps extends Collapsible.CollapsibleProps {
    open?: boolean;
    className?: string;
    trigger?: ReactNode;
}

export enum AnimationStates {
    OPEN_START,
    OPEN,
    CLOSING_START,
    CLOSED,
}

export const FernCollapse: FC<PropsWithChildren<FernCollapseProps>> = ({
    children,
    trigger,
    ...props
}) => {
    return (
        <Collapsible.Root {...props}>
            {trigger && (
                <Collapsible.Trigger asChild>{trigger}</Collapsible.Trigger>
            )}
            <Collapsible.Content className="fern-collapsible">
                <div className="fern-collapsible-child">{children}</div>
            </Collapsible.Content>
        </Collapsible.Root>
    );
};
