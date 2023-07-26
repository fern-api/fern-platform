import { useMemo } from "react";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { useDocsContext } from "../docs-context/useDocsContext";
import { MdxContent } from "../mdx/MdxContent";
import { ResolvedUrlPath } from "../ResolvedUrlPath";
import { TableOfContents } from "./TableOfContents";
import { paymentRefundRequest } from "./webhook-requests/payment-refund";
import { paymentStatusUpdateRequest } from "./webhook-requests/payment-status-update";
import { WebhookRequestExample } from "./WebhookRequestExample";

export declare namespace CustomDocsPage {
    export interface Props {
        path: ResolvedUrlPath.MdxPage;
    }
}

export const CustomDocsPage: React.FC<CustomDocsPage.Props> = ({ path }) => {
    const { resolvePage, selectedSlug } = useDocsContext();

    const page = useMemo(() => resolvePage(path.page.id), [path.page.id, resolvePage]);

    const content = useMemo(() => {
        return <MdxContent mdx={path.serializedMdxContent} />;
    }, [path]);

    // TODO: Remove after demo
    const isPaymentStatusUpdateWebhookPage =
        selectedSlug != null && selectedSlug.endsWith("primer-webhooks/payment-status-update");
    const isPaymentRefundWebhookPage = selectedSlug != null && selectedSlug.endsWith("primer-webhooks/payment-refund");
    const isWebhookPage = isPaymentStatusUpdateWebhookPage || isPaymentRefundWebhookPage;

    let webhookRequestExample;
    if (isPaymentStatusUpdateWebhookPage) {
        webhookRequestExample = paymentStatusUpdateRequest;
    } else if (isPaymentRefundWebhookPage) {
        webhookRequestExample = paymentRefundRequest;
    }

    return (
        <div className="flex justify-center gap-20 overflow-y-auto px-[10vw] pt-[10vh]">
            <div className="w-[750px]">
                <div className="text-text-primary-light dark:text-text-primary-dark mb-8 text-3xl font-bold">
                    {path.page.title}
                </div>
                {content}
                <BottomNavigationButtons />
                <div className="h-20" />
            </div>
            <TableOfContents className="sticky top-0 hidden shrink-0 md:flex" markdown={page.markdown} />
        </div>
    );
};
