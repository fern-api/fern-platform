import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import urljoin from "url-join";
import { getXFernHostNode } from "../../../utils/xFernHost";

export const config = {
    maxDuration: 300,
};

type ValidPath = string;

function isPath(path: string | undefined): path is ValidPath {
    return typeof path === "string" && path.length > 0 && path[0] === "/";
}

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse<any>): Promise<unknown> => {
    const xFernHost = getXFernHostNode(req, true);

    let path: string | undefined = undefined;

    if (typeof req.query.path === "string") {
        path = req.query.path;
    } else if (typeof req.query.slug === "string") {
        path = `/${req.query.slug}`;
    }

    if (!isPath(path)) {
        return res.status(400).json({ revalidated: false, message: "Invalid path", path });
    }

    const ssgPath = urljoin("/static/", xFernHost, path);

    try {
        await res.revalidate(ssgPath);
    } catch (error) {
        return res.status(500).json({ revalidated: false, message: String(error), path });
    }

    return res.status(200).json({ revalidated: true, path });
};

export default handler;
