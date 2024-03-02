import { DocsPage, getDocsServerSideProps } from "@fern-ui/ui";
import { GetServerSideProps } from "next";
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

export const getServerSideProps: GetServerSideProps = (context) => {
    if (context.query.error === "true") {
        context.res.statusCode = 500;
    }

    return getDocsServerSideProps(context);
};
