import classNames from "classnames";
import { DetailedHTMLProps, forwardRef, HTMLAttributes, PropsWithChildren } from "react";

export declare namespace MonospaceText {
    export type Props = PropsWithChildren<{
        className?: string;
    }>;
}

export const MonospaceText = forwardRef<
    HTMLSpanElement,
    DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>
>(function MonospaceText({ className, children, ...props }, ref) {
    return (
        <span ref={ref} className={classNames(className, "font-mono")} {...props}>
            {children}
        </span>
    );
});
