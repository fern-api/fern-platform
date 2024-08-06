import { useSetAtom } from "jotai";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { SLUG_ATOM } from "../atoms";
import { scrollToRoute } from "../util/anchor";

export function useBeforePopState(): void {
    const router = useRouter();
    const setSlug = useSetAtom(SLUG_ATOM);
    useEffect(() => {
        router.beforePopState(({ as }) => {
            scrollToRoute(as);
            return true;
        });
    }, [router, setSlug]);
}
