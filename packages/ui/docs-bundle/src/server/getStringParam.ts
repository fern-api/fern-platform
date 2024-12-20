import { NextApiRequest } from "next";

export function getStringParam(req: NextApiRequest, param: string): string | undefined {
    const value = req.query[param];
    return typeof value === "string" ? value : undefined;
}
