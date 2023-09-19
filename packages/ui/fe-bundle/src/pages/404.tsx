import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const Core: React.FC<void> = () => {
    const router = useRouter();

    void router.push("/");
    return null;
};

const NotFoundPage = dynamic(() => Promise.resolve(Core), {
    ssr: false,
});

export default NotFoundPage;
