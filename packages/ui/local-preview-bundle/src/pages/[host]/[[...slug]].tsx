import { DocsPage } from "@fern-ui/ui";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";

export default function LocalPreviewDocs(): ReactElement {
    const router = useRouter();
    const [docsProps, setDocsProps] = useState<DocsPage.Props | null>(null);

    useEffect(() => {
        if (router.asPath === "/[host]/[[...slug]]") {
            return;
        }
        async function loadData() {
            // const slugArray = compact(router.asPath.split("/"));
            // const props = await getDocsPageProps(undefined, slugArray);
            const props = {} as any;
            if (props.type === "props") {
                setDocsProps(props.props);
            }
        }
        void loadData();
    }, [router.asPath]);

    if (docsProps == null) {
        return <div>Loading...</div>;
    }

    return <DocsPage {...docsProps} />;
}
