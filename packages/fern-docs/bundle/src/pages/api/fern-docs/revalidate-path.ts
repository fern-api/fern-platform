import { Revalidator } from "@/server/revalidator";
import { getDocsDomainNode } from "@/server/xfernhost/node";
import { FernDocs } from "@fern-fern/fern-docs-sdk";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export const config = {
  maxDuration: 300,
};

// TODO: gate this using a fern token
const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<FernDocs.RevalidationResult>
): Promise<unknown> => {
  const xFernHost = getDocsDomainNode(req);
  const revalidate = new Revalidator(res, xFernHost);

  const path = req.query.path;

  if (typeof path !== "string") {
    return res.status(400).json({
      success: false,
      error: `Invalid path: ${path}`,
      url: revalidate.getUrl(String(path)),
    });
  }

  try {
    const result = await revalidate.path(path);
    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error),
      url: revalidate.getUrl(path),
    });
  }
};

export default handler;
