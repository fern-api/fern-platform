import { DocsPage, getDocsServerSideProps } from "@fern-ui/ui";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";

export default function Page(props: DocsPage.Props): ReactElement | null {
    const router = useRouter();
    const [hydrated, setHydrated] = useState(() => router.query.error !== "true");
    useEffect(() => {
        setHydrated(true);
    }, []);
    if (!hydrated) {
        return null;
    }
    return <DocsPage {...props} />;
}

export const getServerSideProps = getDocsServerSideProps;
