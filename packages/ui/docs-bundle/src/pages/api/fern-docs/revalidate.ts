// eslint-disable-next-line import/no-internal-modules
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import urljoin from "url-join";
import { getXFernHostNode } from "../../../utils/xFernHost";

export const config = {
    maxDuration: 300,
};

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse<any>): Promise<unknown> => {
    const xFernHost = getXFernHostNode(req, true);

    const path = req.query.path;

    if (typeof path !== "string") {
        return res.status(400).json({ revalidated: false, message: "Invalid path" });
    }

    const ssgPath = urljoin("/static/", xFernHost, path);

    try {
        await res.revalidate(ssgPath);
    } catch (error) {
        return res.status(500).json({ revalidated: false, message: String(error) });
    }

    return res.status(200).json({ revalidated: true });
};

export default handler;
