import { useRouter } from "next/router";
import { useEffect } from "react";

const NotFoundPage = async (): Promise<void> => {
    const router = useRouter();

    useEffect(() => {
        void router.push("/");
    });

    return undefined;
};

export default NotFoundPage;
