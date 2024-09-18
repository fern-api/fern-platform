import { VercelClient } from "@fern-fern/vercel";
import { getVercelToken } from "./env.js";

export const vercel = new VercelClient({ token: getVercelToken() });
