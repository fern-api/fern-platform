import { deleteCookie, setCookie } from "cookies-next";
import { NextApiHandler, NextApiResponse } from "next";

const handler: NextApiHandler = async (req, res: NextApiResponse<void>) => {
    if (typeof req.query.host === "string") {
        setCookie("_fern_docs_preview", req.query.host, {
            req,
            res,
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
        });

        return res.redirect("/");
    } else if (typeof req.query.site === "string") {
        setCookie("_fern_docs_preview", `${req.query.site}.docs.buildwithfern.com`, {
            req,
            res,
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
        });

        return res.redirect("/");
    } else if (req.query.clear === "true") {
        deleteCookie("_fern_docs_preview", { req, res });
        return res.redirect("/");
    }

    return res.status(404).send();
};

export default handler;

export const config = {
    runtime: "edge",
};
