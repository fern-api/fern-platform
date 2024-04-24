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
