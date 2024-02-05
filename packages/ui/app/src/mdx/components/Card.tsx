import classNames from "classnames";
import Link from "next/link";
import { RemoteFontAwesomeIcon } from "../../commons/FontAwesomeIcon";

export declare namespace Card {
    export interface Props {
        title: string;
        icon?: string;
        children?: string;
        href?: string;
        iconPosition?: "top" | "left";
    }
}

export const Card: React.FC<Card.Props> = ({ title, icon, iconPosition = "top", children, href }) => {
    const isInternalUrl = typeof href === "string" && href.startsWith("/");
    const isUrlOnThisPage = typeof href === "string" && href.startsWith("#");

    const className = classNames(
        "text-base border-black/20 dark:border-white/20 bg-white/70 dark:bg-white/5 flex items-start rounded-lg border p-4 !no-underline hover:transition mb-4",
        "grow basis-1/4 not-prose",
        {
            "space-y-3 flex-col": iconPosition === "top",
            "space-x-3 flex-row": iconPosition === "left",
        },
        {
            "hover:border-accent-primary hover:dark:border-accent-primary": href != null,
        },
    );

    const content = (
        <>
            <RemoteFontAwesomeIcon className="bg-intent-default dark:bg-intent-default h-5 w-5" icon={icon} />
            <div>
                <div className="text-text-primary-light dark:text-text-primary-dark">{title}</div>
                {children != null && <div className="t-muted mt-1">{children}</div>}
            </div>
        </>
    );

    if (isInternalUrl || isUrlOnThisPage) {
        return (
            <Link className={className} href={href}>
                {content}
            </Link>
        );
    }

    const Component = href != null ? "a" : "div";
    return (
        <Component className={className} href={href}>
            {content}
        </Component>
    );
};
