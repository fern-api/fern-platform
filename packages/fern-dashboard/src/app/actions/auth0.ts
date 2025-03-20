import { ManagementClient } from "auth0";

// eslint-disable-next-line turbo/no-undeclared-env-vars
const { AUTH0_BASE_URL, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } = process.env;

if (AUTH0_BASE_URL == null) {
  throw new Error("AUTH0_BASE_URL is not defined");
}
if (AUTH0_CLIENT_ID == null) {
  throw new Error("AUTH0_CLIENT_ID is not defined");
}
if (AUTH0_CLIENT_SECRET == null) {
  throw new Error("AUTH0_CLIENT_SECRET is not defined");
}

export const AUTH0_MANAGEMENT_CLIENT = new ManagementClient({
  domain: AUTH0_BASE_URL,
  clientId: AUTH0_CLIENT_ID,
  clientSecret: AUTH0_CLIENT_SECRET,
});
