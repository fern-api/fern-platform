/* eslint-disable react-hooks/rules-of-hooks */
import { useCallback } from "react";
import useSWR, { mutate } from "swr";
import urljoin from "url-join";
import { useBasePath } from "../atoms/navigation";

type PartnerLoginEndpoint =
    | {
          enabled: true;
          loginEndpoint: string;
      }
    | {
          enabled: false;
      };

export function usePartnerLoginService(): [PartnerLoginEndpoint, refresh: () => void] {
    const basePath = useBasePath();
    const key = urljoin(basePath ?? "/", "/api/fern-docs/partner-login");

    const { data } = useSWR<PartnerLoginEndpoint>(
        key,
        async (url: string) => {
            const res = await fetch(url);
            return res.json();
        },
        {
            refreshInterval: 1000 * 60 * 60 * 2, // 2 hours
            revalidateOnFocus: false,
        },
    );

    const refresh = useCallback(() => {
        void mutate(key);
    }, [key]);

    return [data ?? { enabled: false }, refresh];
}
