import classNames from "classnames";
import { PropsWithChildren, ReactElement } from "react";

interface BleedProps {
    full?: boolean;
}

export function Bleed({ full = false, children }: PropsWithChildren<BleedProps>): ReactElement {
    return (
        <div
            className={classNames(
                "fern-bleed relative -mx-6 mt-6 md:-mx-8 2xl:-mx-24",
                full && [
                    "ltr:xl:ml-[calc(50%-50vw+16rem)] ltr:xl:mr-[calc(50%-50vw)]",
                    "rtl:xl:ml-[calc(50%-50vw)] rtl:xl:mr-[calc(50%-50vw+16rem)]",
                ],
            )}
        >
            {children}
        </div>
    );
}
