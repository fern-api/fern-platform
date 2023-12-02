import { Url } from "next/dist/shared/lib/router/router";
import { resolveHref } from "next/dist/shared/lib/router/utils/resolve-href";
import Router from "next/router";
import { AbsolutelyPositionedAnchor } from "../../commons/AbsolutelyPositionedAnchor";
import { HEADER_HEIGHT } from "../../constants";
import { Markdown } from "../markdown/Markdown";

export declare namespace WebhookSection {
    export type Props = React.PropsWithChildren<{
        title: string;
        description?: string;
        href: Url;
    }>;
}

export const WebhookSection: React.FC<WebhookSection.Props> = ({ title, description, href, children }) => {
    return (
        <div
            data-route={resolveHref(Router, href)}
            className="flex flex-col"
            style={{
                scrollMarginTop: HEADER_HEIGHT,
            }}
        >
            <div className="group/anchor-container relative mb-3 flex items-center">
                <AbsolutelyPositionedAnchor href={href} verticalPosition="center" />
                <div className="text-text-primary-light dark:text-text-primary-dark text-xl font-extrabold">
                    {title}
                </div>
            </div>
            {description != null && (
                <div className="mb-2">
                    <Markdown>{description}</Markdown>
                </div>
            )}
            <div className="flex flex-col">{children}</div>
        </div>
    );
};
