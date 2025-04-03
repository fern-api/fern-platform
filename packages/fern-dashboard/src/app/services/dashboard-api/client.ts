import { getMyDocsSites } from "@/app/api/get-my-docs-sites/route";
import { getMyOrganizations } from "@/app/api/get-my-organizations/route";
import { getOrgInvitations } from "@/app/api/get-org-invitations/route";
import { getOrgMembers } from "@/app/api/get-org-members/route";
import { getHomepageImageUrl } from "@/app/api/homepage-images/get/route";

export const DashboardApiClient = {
  getMyDocsSites: (): Promise<getMyDocsSites.Response> =>
    typedFetch<getMyDocsSites.Response>("/api/get-my-docs-sites"),
  getMyOrganizations: () =>
    typedFetch<getMyOrganizations.Response>("/api/get-my-organizations"),
  getOrgInvitations: () =>
    typedFetch<getOrgInvitations.Response>("/api/get-org-invitations"),
  getOrgMembers: (): Promise<getOrgMembers.Response> =>
    typedFetch<getOrgMembers.Response>("/api/get-org-members"),
  getHomepageImages: (request: getHomepageImageUrl.Request) =>
    typedFetch<getHomepageImageUrl.Response>("/api/homepage-images/get", {
      body: request,
    }),
};

async function typedFetch<T>(
  url: string,
  {
    body,
    method = body != null ? "POST" : "GET",
  }: {
    method?: "GET" | "POST";
    body?: unknown;
  } = {}
): Promise<T> {
  const response = await fetch(url, {
    method: method,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  const responseText = await response.text().catch(() => "");

  if (!response.ok) {
    console.error("Request failed", { url, body, responseText });
    throw new Error("Request failed: " + responseText);
  }

  let json: unknown;
  try {
    json = JSON.parse(responseText);
  } catch (e) {
    console.error(
      "Failed to deserialize response",
      { url, body, responseText },
      e
    );
    throw new Error("Failed to deserialize response");
  }

  return json as T;
}
