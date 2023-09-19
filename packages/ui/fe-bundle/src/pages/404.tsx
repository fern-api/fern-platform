import { useRouter } from "next/router";

const NotFoundPage = async (): Promise<void> => {
    const router = useRouter();

    void router.push("/");
};

export default NotFoundPage;
