export declare namespace RemoteFontAwesomeIcon {
    export interface Props {
        className?: string; // you must specify the bg-color rather than text-color because this is a mask.
        icon?: string;
    }
}
export const RemoteFontAwesomeIcon: React.FC<RemoteFontAwesomeIcon.Props> = ({ className, icon }) => {
    return (
        <svg
            className={className}
            style={{
                maskImage: `url("${getIconUrl(icon)}")`,
                maskRepeat: "no-repeat",
                maskPosition: "center center",
                WebkitMaskImage: `url("${getIconUrl(icon)}")`,
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center center",
            }}
        ></svg>
    );
};

function getIconUrl(icon: string | undefined): string {
    const parsed = parseFontAwesomeIcon(icon);
    if (!parsed) {
        return "";
    }
    const [style, iconName] = parsed;
    return `${getCdnHost()}/${style}/${iconName}.svg`;
}

function getCdnHost() {
    const CDN_HOST = process.env.NEXT_PUBLIC_FONTAWESOME_CDN_HOST;
    if (CDN_HOST == null) {
        throw new Error("NEXT_PUBLIC_FONTAWESOME_CDN_HOST is not set");
    }
    return CDN_HOST;
}

function parseFontAwesomeIcon(icon: string | undefined): [string, string] | undefined {
    if (!icon) {
        return;
    }
    const [left, right] = icon.split(" ");
    if (left && right) {
        return [left.replace("fa-", ""), right.replace("fa-", "")];
    }
    if (left) {
        return ["solid", left.replace("fa-", "")];
    }
    return;
}
