import classNames from "classnames";
import { RemoteFontAwesomeIcon } from "../../commons/FontAwesomeIcon";
import { FernCard, FernLinkCard } from "../../components/FernCard";

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
    const className = classNames("text-sm flex items-start border p-4 mb-4 grow basis-1/4 not-prose rounded-lg", {
        "space-y-3 flex-col": iconPosition === "top",
        "space-x-3 flex-row": iconPosition === "left",
    });

    const content = (
        <>
            <RemoteFontAwesomeIcon className="bg-intent-default dark:bg-intent-default-dark h-5 w-5" icon={icon} />
            <div>
                <div className="text-text-default-light dark:text-text-default-dark font-medium">{title}</div>
                {children != null && <div className="t-muted mt-1 text-xs">{children}</div>}
            </div>
        </>
    );

    if (href != null) {
        return (
            <FernLinkCard className={className} href={href}>
                {content}
            </FernLinkCard>
        );
    }
    return <FernCard className={className}>{content}</FernCard>;
};
