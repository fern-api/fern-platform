import dynamic from "next/dynamic";

// TODO: delete blueprint icons to reduce bundle size
export const BlueprintIcon = dynamic(() => import("@blueprintjs/core").then(({ Icon }) => Icon), {
    ssr: false,
});
