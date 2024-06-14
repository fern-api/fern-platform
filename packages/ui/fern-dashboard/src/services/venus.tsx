import { getEnvVar } from "@/utils";
import { FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { Organization, OrganizationId } from "@fern-api/venus-api-sdk/api";
import { UseQueryResult, queryOptions, useQueries, useQuery } from "@tanstack/react-query";
import { getAPIResponse } from "./fern";

export function getVenusClient({ token }: { token: string }) {
    return new FernVenusApiClient({
        environment: getEnvVar("VENUS_ORIGIN", "https://venus-dev2.buildwithfern.com"),
        token,
    });
}

export function useOrganization(token: string | undefined, orgId: string): UseQueryResult<Organization | undefined> {
    return useQuery({
        queryKey: ["organization", orgId],
        queryFn: () => getVenusClient({ token: token! }).organization.get(OrganizationId(orgId)),
        select: (data) => getAPIResponse(data),
        enabled: !!token,
    });
}

export function useOrganizations(token: string | undefined): {
    data: (Organization | undefined)[];
    isLoading: boolean;
} {
    const { isLoading, data: orgIds } = useOrganizationIds(token);
    return useQueries({
        queries: (orgIds ?? []).map((orgId) =>
            queryOptions({
                queryKey: ["organization", orgId],
                queryFn: () => getVenusClient({ token: token! }).organization.get(OrganizationId(orgId)),
                select: (data) => getAPIResponse(data),
                enabled: !!token && !isLoading,
            }),
        ),
        combine: (results) => {
            return {
                data: results.map((result) => result.data),
                isLoading: results.some((result) => result.isLoading),
            };
        },
    });
}

export function useOrganizationIds(token: string | undefined): UseQueryResult<string[] | undefined> {
    return useQuery({
        queryKey: ["getOrgIdsFromToken"],
        queryFn: () => getVenusClient({ token: token! }).organization.getOrgIdsFromToken(),
        select: (data) => getAPIResponse(data),
        enabled: !!token,
    });
}
