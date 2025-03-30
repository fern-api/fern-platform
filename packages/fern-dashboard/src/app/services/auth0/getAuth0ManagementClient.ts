import { ManagementClient } from "auth0";

let AUTH0_MANAGEMENT_CLIENT: ManagementClient | undefined;

export function getAuth0ManagementClient() {
  if (AUTH0_MANAGEMENT_CLIENT == null) {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } = process.env;

    if (AUTH0_DOMAIN == null) {
      throw new Error("AUTH0_DOMAIN is not defined");
    }
    if (AUTH0_CLIENT_ID == null) {
      throw new Error("AUTH0_CLIENT_ID is not defined");
    }
    if (AUTH0_CLIENT_SECRET == null) {
      throw new Error("AUTH0_CLIENT_SECRET is not defined");
    }

    AUTH0_MANAGEMENT_CLIENT = new ManagementClient({
      domain: AUTH0_DOMAIN,
      clientId: AUTH0_CLIENT_ID,
      clientSecret: AUTH0_CLIENT_SECRET,
    });
  }

  return AUTH0_MANAGEMENT_CLIENT;
}
