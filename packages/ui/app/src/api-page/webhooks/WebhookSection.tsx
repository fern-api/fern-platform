import { Url } from "next/dist/shared/lib/router/router";
import { resolveHref } from "next/dist/shared/lib/router/utils/resolve-href";
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
    return (
        <div data-route={resolveHref(useRouter(), href)} className="flex scroll-mt-16 flex-col">
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
