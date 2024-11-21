import { FileText } from "lucide-react";
import { SVGProps, forwardRef } from "react";
import useSWRImmutable from "swr/immutable";

export const RemoteIcon = forwardRef<SVGSVGElement, { icon: string } & SVGProps<SVGSVGElement>>(
    ({ icon, ...props }, ref) => {
        const { data } = useSWRImmutable(icon, () => fetch(getIconUrl(icon)).then((res) => res.text()));

        if (data == null) {
            return <FileText ref={ref} {...props} />;
        }

        // parse the svg
        const { props: svgProps, body } = parseSvg(data);
        delete svgProps.class;
        delete svgProps.className;
        delete svgProps.hidden;

        return (
            <svg
                ref={ref}
                xmlns="http://www.w3.org/2000/svg"
                {...props}
                {...svgProps}
                aria-hidden="true"
                focusable="false"
                role="img"
                dangerouslySetInnerHTML={{ __html: body }}
            />
        );
    },
);

RemoteIcon.displayName = "RemoteIcon";

// parse the svg
function parseSvg(svg: string): {
    props: Record<string, string>;
    body: string;
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
        const propMatches = propsStr.matchAll(/(\w+)="([^"]*)"/g);
        for (const [_, key, value] of propMatches) {
            props[key] = value;
        }
    }
    return { props, body };
}

function getIconUrl(icon: string | undefined): string {
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
        (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_FONTAWESOME_CDN_HOST : undefined) ??
        "https://icons.ferndocs.com"
    );
}

function parseFontAwesomeIcon(icon: string): [string, string] | undefined {
    const [left, right] = icon.split(" ");
    if (left && right) {
        return [left.replace("fa-", ""), right.replace("fa-", "")];
    }
    if (left) {
        return ["solid", left.replace("fa-", "")];
    }
    return;
}
