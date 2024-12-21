import { useRouter } from "next/router";
import { useEffect } from "react";
import { scrollToRoute } from "../util/anchor";

export function useBeforePopState(): void {
  const router = useRouter();
  useEffect(() => {
    router.beforePopState(({ as }) => {
      scrollToRoute(as);
      return true;
    });
  }, [router]);
}
