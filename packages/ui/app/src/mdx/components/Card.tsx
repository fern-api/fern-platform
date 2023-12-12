import classNames from "classnames";
import Link from "next/link";
import { FontAwesomeIcon } from "../../commons/FontAwesomeIcon";
import { useNavigationContext } from "../../navigation-context";

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
    const { navigateToPath } = useNavigationContext();
    const isInternalUrl = typeof href === "string" && href.startsWith("/");
    const isUrlOnThisPage = typeof href === "string" && href.startsWith("#");

    const className = classNames(
        "border-border-default-light dark:border-border-default-dark bg-background-tertiary-light dark:bg-background-tertiary-dark flex items-start rounded-lg border p-4 !no-underline hover:transition mb-4",
        "grow basis-1/4",
        {
            "space-y-3 flex-col": iconPosition === "top",
            "space-x-3 flex-row": iconPosition === "left",
        },
        {
            "hover:border-accent-primary hover:dark:border-accent-primary": href != null,
        }
    );

    const content = (
        <>
            <FontAwesomeIcon className="text-intent-default dark:text-intent-default h-5 w-5" icon={icon} />
            <div>
                <div className="text-text-primary-light dark:text-text-primary-dark font-normal">{title}</div>
                {children != null && <div className="t-muted mt-1">{children}</div>}
            </div>
        </>
    );

    if (isInternalUrl || isUrlOnThisPage) {
        const slug = href.slice(1, href.length);
        return (
            <Link
                className={className}
                href={href}
                onClick={() => {
                    if (isInternalUrl) {
                        navigateToPath(slug);
                    }
                }}
            >
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
