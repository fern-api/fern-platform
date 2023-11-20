import dynamic from "next/dynamic";

export const BlueprintIcon = dynamic(
    () => import("@blueprintjs/core/lib/esm/components/icon/icon").then(({ Icon }) => Icon),
    {
        ssr: false,
    }
);
