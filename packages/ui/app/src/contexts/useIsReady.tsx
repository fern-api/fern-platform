import { useRouter } from "next/router";
import { createContext, PropsWithChildren, useContext, useEffect, useState, useTransition } from "react";

const IsReadyContext = createContext<boolean>(false);

export const IsReadyProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const router = useRouter();
    const [, startTransition] = useTransition();
    const [isReady, setIsReady] = useState(false);
    useEffect(() => {
        if (router.isReady) {
            startTransition(() => {
                setIsReady(true);
            });
        }
    }, [router.isReady]);
    return <IsReadyContext.Provider value={isReady}>{children}</IsReadyContext.Provider>;
};

export function useIsReady(): boolean {
    return useContext(IsReadyContext);
}
