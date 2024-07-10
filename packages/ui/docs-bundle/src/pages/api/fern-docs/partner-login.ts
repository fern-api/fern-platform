import { get } from "@vercel/edge-config";
import { NextRequest, NextResponse } from "next/server";
import { getXFernHostEdge } from "../../../utils/xFernHost";

export const runtime = "edge";

export type PartnerLoginConfig = {
    authEndpoint: string;
    clientId: string;
    loginEndpoint: string;
    secret: string;
};

type PartnerLoginEndpoint =
    | {
          enabled: true;
          loginEndpoint: string;
      }
    | {
          enabled: false;
      };

export default async function handler(req: NextRequest): Promise<NextResponse<PartnerLoginEndpoint>> {
    const domain = getXFernHostEdge(req);
    const partnerLoginConfig = await getPartnerLoginConfig(domain);
    if (!partnerLoginConfig) {
        return NextResponse.json({ enabled: false });
    }
    return NextResponse.json({
        enabled: true,
        loginEndpoint: partnerLoginConfig.loginEndpoint,
    });
}

export async function getPartnerLoginConfig(currentDomain: string): Promise<PartnerLoginConfig | undefined> {
    const domainToTokenConfigMap = await get<Record<string, PartnerLoginConfig>>("partner-login");

    for (const domain in domainToTokenConfigMap) {
        if (currentDomain.includes(domain)) {
            return domainToTokenConfigMap[domain];
        }
    }
    return undefined;
}
