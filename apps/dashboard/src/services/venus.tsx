import { getEnvVar } from "@/utils";
import { FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { Organization, OrganizationId } from "@fern-api/venus-api-sdk/api";
import { UseQueryResult, queryOptions, useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAPIResponse } from "./fern";

export function getVenusClient({ token }: { token: string }) {
    return new FernVenusApiClient({
        environment: getEnvVar("VENUS_ORIGIN", "https://venus-dev2.buildwithfern.com"),
        token,
    });
}

function getOrganizationQueryKey(orgId: string) {
    return ["organization", orgId];
}

export function useOrganization(
    token: string | undefined,
    orgId: string | undefined,
    shouldIncludeFernUsers: boolean | undefined,
): UseQueryResult<Organization | undefined> {
    return useQuery({
        queryKey: getOrganizationQueryKey(orgId!),
        queryFn: () =>
            getVenusClient({ token: token! }).organization.get(OrganizationId(orgId!), { shouldIncludeFernUsers }),
        select: (data) => getAPIResponse(data),
        enabled: !!token && !!orgId,
    });
}

export function useOrganizations(
    token: string | undefined,
    shouldIncludeFernUsers: boolean | undefined,
): {
    data: (Organization | undefined)[];
    isLoading: boolean;
} {
    const { isLoading, data: orgIds } = useOrganizationIds(token);
    return useQueries({
        queries: (orgIds ?? []).map((orgId) =>
            queryOptions({
                queryKey: getOrganizationQueryKey(orgId),
                queryFn: () =>
                    getVenusClient({ token: token! }).organization.get(OrganizationId(orgId), {
                        shouldIncludeFernUsers,
                    }),
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

export function useRemoveUserFromOrg(organization: Organization) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ token, userId }: { token: string; userId: string }) =>
            getVenusClient({ token }).organization.removeUser({
                userId,
                auth0OrgId: OrganizationId(organization.auth0Id),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: getOrganizationQueryKey(organization.organizationId),
            });
        },
    });
}
