import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Fragment, ReactElement } from "react";
import { useFeatureFlags } from "../atoms/flags";
import { useIsReady } from "../atoms/window";
import { useNavigationContext } from "../contexts/navigation-context";
import { FeedbackPopover } from "../custom-docs-page/FeedbackPopover";
import { ChangelogEntryPage } from "./ChangelogEntryPage";

const CustomDocsPage = dynamic(
    () => import("../custom-docs-page/CustomDocsPage").then(({ CustomDocsPage }) => CustomDocsPage),
    { ssr: true },
);

const ApiPage = dynamic(() => import("../api-page/ApiPage").then(({ ApiPage }) => ApiPage), {
    ssr: true,
});

const ChangelogPage = dynamic(() => import("./ChangelogPage").then(({ ChangelogPage }) => ChangelogPage), {
    ssr: true,
});

export interface DocsMainContentProps {}

function DocsMainContentInternal(): ReactElement | null {
    const { resolvedPath } = useNavigationContext();
    const hydrated = useIsReady();

    const router = useRouter();
    if (router.query.error === "true") {
        if (!hydrated) {
            return null;
        }
    }

    if (resolvedPath.type === "custom-markdown-page") {
        return <CustomDocsPage serializedMdxContent={resolvedPath.serializedMdxContent} resolvedPath={resolvedPath} />;
    } else if (resolvedPath.type === "api-page") {
        return <ApiPage initialApi={resolvedPath.apiDefinition} showErrors={resolvedPath.showErrors} />;
    } else if (resolvedPath.type === "changelog") {
        return <ChangelogPage resolvedPath={resolvedPath} />;
    } else if (resolvedPath.type === "changelog-entry") {
        return <ChangelogEntryPage resolvedPath={resolvedPath} />;
    } else {
        return null;
    }
}

export function DocsMainContent(): ReactElement {
    const { isInlineFeedbackEnabled } = useFeatureFlags();

    const FeedbackPopoverProvider = isInlineFeedbackEnabled ? FeedbackPopover : Fragment;
    return (
        <FeedbackPopoverProvider>
            <DocsMainContentInternal />
        </FeedbackPopoverProvider>
    );
}
