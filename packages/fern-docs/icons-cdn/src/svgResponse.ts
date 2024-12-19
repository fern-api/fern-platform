import {
  AbstractElement,
  findIconDefinition,
  icon,
  IconPrefix,
} from "@fortawesome/fontawesome-svg-core";
import { IconName } from "@fortawesome/free-brands-svg-icons";
import { NextResponse } from "next/server";

// This gets called on every request
export function svgResponse(
  prefix: IconPrefix,
  iconName: string
): NextResponse {
  if (!iconName.endsWith(".svg")) {
    const icon = findIconDefinition({
      prefix,
      iconName: iconName as IconName,
    });
    if (icon === undefined) {
      return new NextResponse(null, { status: 404 });
    }

    return NextResponse.json(icon);
  }

  const foundIcon = icon({
    prefix,
    iconName: iconName.replace(".svg", "") as IconName,
  });

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
