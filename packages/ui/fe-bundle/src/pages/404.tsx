import { GetStaticProps } from "next/types";
import { REGISTRY_SERVICE } from "../service";
import { buildUrl } from "../utils/buildUrl";

const NotFoundPage: React.FC<void> = () => {
    return null;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const getStaticProps: GetStaticProps<{}> = async ({ params = {} }) => {
    const host = params.host as string | undefined;
    const slugArray = params.slug as string[] | undefined;
    const pathname = slugArray != null ? slugArray.join("/") : "";
    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
        url: process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? buildUrl({ host: host ?? "", pathname }),
    });
    const basePath = docs.ok ? docs.body.baseUrl.basePath : undefined;
    return {
        redirect: {
            permanent: false,
            destination: basePath ?? "/",
        },
        revalidate: 60,
    };
};

export default NotFoundPage;
