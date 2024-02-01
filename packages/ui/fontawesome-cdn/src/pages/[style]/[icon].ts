import { AbstractElement, icon, IconPrefix, library } from "@fortawesome/fontawesome-svg-core";
import { fab, IconName } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fad } from "@fortawesome/pro-duotone-svg-icons";
import { fal } from "@fortawesome/pro-light-svg-icons";
import { far } from "@fortawesome/pro-regular-svg-icons";
import { fas as fasPro } from "@fortawesome/pro-solid-svg-icons";
import { GetServerSideProps } from "next";

library.add(fas, fab, fad, fal, far, fasPro);

export default function FontawesomeIcon(): null {
    return null;
}

// This gets called on every request
export const getServerSideProps: GetServerSideProps = async ({ params = {}, res }) => {
    const { style, icon: iconName } = params;

    if (typeof style !== "string" || typeof iconName !== "string" || !iconName.endsWith(".svg")) {
        return { notFound: true };
    }
    const prefix = getIconPrefix(style);

    const foundIcon = icon({ prefix, iconName: iconName.replace(".svg", "") as IconName });

    if (foundIcon == null || foundIcon.abstract[0] == null) {
        return { notFound: true };
    }

    const iconAbstract = foundIcon.abstract[0];

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");

    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.write(abstractToString(iconAbstract));
    res.end();
    return { props: {} };
};

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
