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
    const className = classNames("text-sm flex items-start border p-4 grow basis-1/4 not-prose rounded-lg", {
        "space-y-3 flex-col": iconPosition === "top",
        "space-x-3 flex-row": iconPosition === "left",
    });

    const content = (
        <>
            <RemoteFontAwesomeIcon className="bg-accent size-6" icon={icon} />
            <div>
                <div className="t-default text-base font-semibold">{title}</div>
                {children != null && <div className="t-muted mt-1 leading-snug">{children}</div>}
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
