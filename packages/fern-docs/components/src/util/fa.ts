// parse the svg
export function parseSvg(svg: string): {
  props: Record<string, string>;
  body: string | undefined;
} {
  const props: Record<string, string> = {};
  const match = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  if (!match) {
    return { props: {}, body: svg };
  }
  const [_, body] = match;

  // extract props from opening svg tag
  const propsMatch = svg.match(/<svg([^>]*)>/);
  if (propsMatch) {
    const propsStr = propsMatch[1];
    const propMatches = propsStr?.matchAll(/(\w+)="([^"]*)"/g) ?? [];
    for (const [_, key, value] of propMatches) {
      if (key && value) {
        props[key] = value;
      }
    }
  }
  return { props, body };
}

export function getIconUrl(icon: string | undefined): string {
  if (icon == null) {
    return "";
  }

  if (icon.startsWith("http")) {
    return icon;
  }

  const parsed = parseFontAwesomeIcon(icon);
  if (!parsed) {
    return "";
  }
  const [style, iconName] = parsed;
  return `${getCdnHost()}/${style}/${iconName}.svg`;
}

function getCdnHost() {
  return (
    (typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_FONTAWESOME_CDN_HOST
      : undefined) ?? "https://icons.ferndocs.com"
  );
}

// parse any font awesome icon into two parts: style and icon name
function parseFontAwesomeIcon(icon: string): [string, string] | undefined {
  const parts = icon.replaceAll("fa-", "").split(" ");
  if (parts.length === 0) {
    return;
  }

  // if no style is specified, default to solid style
  if (parts.length === 1 && parts[0] != null) {
    return ["solid", parts[0]];
  }

  const iconName = parts.pop();
  if (iconName == null) {
    return;
  }

  // if multiple styles are specified, join them with a dash
  const style = parts.join("-");
  return [style, iconName];
}
