import { useBasePath, useFeatureFlags } from "../atoms";
import { getAppBuildwithfernCom } from "../playground/PlaygroundEndpoint";
import { useApiRoute } from "./useApiRoute";

export function useStandardProxyEnvironment(): string {
    const basePath = useBasePath();
    const { proxyShouldUseAppBuildwithfernCom } = useFeatureFlags();
    const proxyBasePath = proxyShouldUseAppBuildwithfernCom ? getAppBuildwithfernCom() : basePath;
    return useApiRoute("/api/fern-docs/proxy", { basepath: proxyBasePath });
}
