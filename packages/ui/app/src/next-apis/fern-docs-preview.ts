import { setCookie } from "cookies-next";
import { NextApiHandler, NextApiResponse } from "next";

export const fernDocsPreviewHandler: NextApiHandler = async (req, res: NextApiResponse<void>) => {
    if (typeof req.query.host !== "string") {
        res.status(404).end();
        return;
    }

    setCookie("_fern_docs_preview", req.query.host, {
        req,
        res,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
    });

    return res.redirect("/");
};
