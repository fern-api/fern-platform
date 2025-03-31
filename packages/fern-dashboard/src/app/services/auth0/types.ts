/* eslint-disable @typescript-eslint/no-invalid-void-type */

const createBrandedStringCreator = <T>(value: string) => value as T;

export type Auth0OrgID = string & { __Auth0OrgID: void };
export const Auth0OrgID = createBrandedStringCreator<Auth0OrgID>;

export type Auth0OrgName = string & { __Auth0OrgName: void };
export const Auth0OrgName = createBrandedStringCreator<Auth0OrgName>;

export type Auth0UserID = string & { __Auth0UserID: void };
export const Auth0UserID = createBrandedStringCreator<Auth0UserID>;
