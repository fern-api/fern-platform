import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { GetStaticProps } from "next/types";
import { REGISTRY_SERVICE } from "../services/registry";
import { buildUrl } from "../util/buildUrl";

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

export const NotFoundPage = dynamic(() => Promise.resolve(Core), {
    ssr: false,
});

export const getNotFoundPageStaticProps: GetStaticProps<NotFoundPage.Props> = async ({ params = {} }) => {
    const host = params.host as string | undefined;
    const slugArray = params.slug as string[] | undefined;
    const pathname = slugArray != null ? slugArray.join("/") : "";
    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
        url: process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? buildUrl({ host: host ?? "", pathname }),
    });

    if (!docs.ok) {
        return { redirect: { destination: "/", permanent: false } };
    }

    const basePath = docs.body.baseUrl.basePath;

    return { redirect: { destination: basePath ?? "/", permanent: false } };
};
