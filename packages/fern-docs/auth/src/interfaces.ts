import { Impersonator, User } from "@workos-inc/node";
import { FernUser } from "./types";

export interface WorkOSSession {
  accessToken: string;
  refreshToken: string;
  user: User;
  impersonator?: Impersonator;
}

export interface FernJWTSession {
  fern: FernUser;
}

export interface WorkOSUserInfo {
  user: User;
  sessionId: string;
  organizationId?: string;
  role?: string;
  permissions?: string[];
  impersonator?: Impersonator;
  accessToken: string;
}

export interface NoWorkOSUserInfo {
  user: null;
  sessionId?: undefined;
  organizationId?: undefined;
  role?: undefined;
  permissions?: undefined;
  impersonator?: undefined;
  accessToken?: undefined;
}

export interface AccessToken {
  sid: string;
  org_id?: string;
  role?: string;
  permissions?: string[];
}
