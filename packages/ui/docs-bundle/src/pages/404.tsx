import { buildUrl } from "@fern-ui/fdr-utils";
import { REGISTRY_SERVICE } from "@fern-ui/ui";
import { GetStaticProps } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

export declare namespace NotFoundPage {
    export interface Props {
        basePath: string | null;
    }
}

const Core: React.FC<NotFoundPage.Props> = ({ basePath }) => {
    const router = useRouter();
    void router.push(basePath ?? "/");
    return null;
};

const NotFoundPage = dynamic(() => Promise.resolve(Core), {
    ssr: false,
});

export default NotFoundPage;

export const getStaticProps: GetStaticProps<NotFoundPage.Props> = async ({ params = {} }) => {
    const host = params.host as string | undefined;
    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
        url: process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? buildUrl({ host: host ?? "" }),
    });

    if (!docs.ok) {
        return { props: { basePath: null } };
    }

    const basePath = docs.body.baseUrl.basePath ?? null;

    return { props: { basePath } };
};
