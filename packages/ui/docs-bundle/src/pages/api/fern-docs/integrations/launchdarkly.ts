import { verifyFernJWTConfig } from "@/server/auth/FernJWT";
import { getXFernHostEdge } from "@/server/xfernhost/edge";
import { LaunchDarklyEdgeConfig, getAuthEdgeConfig, getLaunchDarklySettings } from "@fern-ui/fern-docs-edge";
import { COOKIE_EMAIL, COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse, userAgent } from "next/server";

export const runtime = "edge";

interface LaunchDarklyInfo {
    clientSideId: string;
    kind: "multi";
    user:
        | { anonymous: true }
        | {
              key: string;
              email?: string;
              name?: string;
          };
    device: {
        key: string;
        [key: string]: unknown;
    };
}

export default async function handler(req: NextRequest): Promise<NextResponse<LaunchDarklyInfo | undefined>> {
    const domain = getXFernHostEdge(req);

    const config = await safeGetLaunchDarklySettings(domain);
    const clientSideId = config?.["client-side-id"];

    if (clientSideId == null) {
        return NextResponse.json(undefined, { status: 404 });
    }

    return NextResponse.json({
        clientSideId,
        kind: "multi" as const,
        user: await getUserContext(req),
        device: await getDeviceContext(req),
    });
}

async function hashString(input: string | undefined): Promise<string | undefined> {
    if (!input) {
        return undefined;
    }

    // Encode the input string as a Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    // Hash the data using SHA-256
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    // Convert the hash to a hexadecimal string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");

    return hashHex;
}

async function getUserContext(req: NextRequest): Promise<LaunchDarklyInfo["user"]> {
    const jar = cookies();

    const fernToken = jar.get(COOKIE_FERN_TOKEN)?.value;
    const email = jar.get(COOKIE_EMAIL)?.value;

    if (fernToken) {
        try {
            const user = await verifyFernJWTConfig(fernToken, await getAuthEdgeConfig(getXFernHostEdge(req)));
            const key = (await hashString(user.email)) ?? randomUUID();
            return { key: `fern-docs-user-${key}`, email: user.email, name: user.name };
        } catch (e) {
            // do nothing
        }
    }

    if (email) {
        const key = (await hashString(email)) ?? randomUUID();
        return { key: `fern-docs-user-${key}`, email };
    }

    return { anonymous: true };
}

async function getDeviceContext(req: NextRequest): Promise<LaunchDarklyInfo["device"]> {
    const agent = userAgent(req);

    const hash = (await hashString(agent.ua)) ?? randomUUID();

    return {
        ...agent,
        key: `fern-docs-device-${hash}`,
        locale: req.nextUrl.locale,
    };
}

async function safeGetLaunchDarklySettings(domain: string): Promise<LaunchDarklyEdgeConfig | undefined> {
    try {
        return await getLaunchDarklySettings(domain);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return undefined;
    }
}
