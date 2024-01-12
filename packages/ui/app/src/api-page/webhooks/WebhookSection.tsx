import { resolveHref } from "next/dist/client/resolve-href";
import { Url } from "next/dist/shared/lib/router/router";
import { useRouter } from "next/router";
import { AbsolutelyPositionedAnchor } from "../../commons/AbsolutelyPositionedAnchor";
import { Markdown } from "../markdown/Markdown";

export declare namespace WebhookSection {
    export type Props = React.PropsWithChildren<{
        title: string;
        description?: string;
        href: Url;
    }>;
}

export const WebhookSection: React.FC<WebhookSection.Props> = ({ title, description, href, children }) => {
    const resolvedHref = resolveHref(useRouter(), href);
    return (
        <div data-route={resolvedHref} id={resolvedHref.split("#")[1]} className="flex scroll-mt-20 flex-col">
            <div className="group/anchor-container relative mb-3 flex items-center">
                <div className="text-text-primary-light dark:text-text-primary-dark relative flex items-center text-xl font-extrabold">
                    <AbsolutelyPositionedAnchor href={href} />
                    <span>{title}</span>
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
