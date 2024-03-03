import { AbstractElement, icon, IconPrefix, library } from "@fortawesome/fontawesome-svg-core";
import { fab, IconName } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fad } from "@fortawesome/pro-duotone-svg-icons";
import { fal } from "@fortawesome/pro-light-svg-icons";
import { far } from "@fortawesome/pro-regular-svg-icons";
import { fas as fasPro } from "@fortawesome/pro-solid-svg-icons";
import { NextRequest, NextResponse } from "next/server";

library.add(fas, fab, fad, fal, far, fasPro);

export const runtime = "edge";

// This gets called on every request
export async function GET(
    _req: NextRequest,
    { params }: { params: { style: string; icon: string } },
): Promise<NextResponse> {
    const { style, icon: iconName } = params;

    if (typeof style !== "string" || typeof iconName !== "string" || !iconName.endsWith(".svg")) {
        return new NextResponse(null, { status: 404 });
    }
    const prefix = getIconPrefix(style);

    const foundIcon = icon({ prefix, iconName: iconName.replace(".svg", "") as IconName });

    if (foundIcon == null || foundIcon.abstract[0] == null) {
        return new NextResponse(null, { status: 404 });
    }

    const iconAbstract = foundIcon.abstract[0];

    return new NextResponse(abstractToString(iconAbstract), {
        status: 200,
        headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=31536000, immutable",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
        },
    });
}

const DUOTONE_CSS = "<defs><style>.fa-secondary{opacity:.4}</style></defs>";

function abstractToString(abstract: AbstractElement): string {
    const attributes = Object.entries(abstract.attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ");
    if (abstract.children == null) {
        return `<${abstract.tag} ${attributes} />`;
    } else {
        const children = abstract.children.map(abstractToString).join("");
        if (abstract.tag === "svg") {
            return `<${abstract.tag} ${attributes}>${DUOTONE_CSS}${children}</${abstract.tag}>`;
        }
        return `<${abstract.tag} ${attributes}>${children}</${abstract.tag}>`;
    }
}

function getIconPrefix(style: string): IconPrefix {
    switch (style) {
        case "brands":
            return "fab";
        case "duotone":
            return "fad";
        case "light":
            return "fal";
        case "regular":
            return "far";
        case "solid":
            return "fas";
        default:
            return "fas";
    }
}
