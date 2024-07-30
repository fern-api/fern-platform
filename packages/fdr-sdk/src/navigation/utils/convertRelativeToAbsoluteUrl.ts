export function convertRelativeToAbsoluteUrl(domain: string, slug: string, relativeUrl: string) {
    const urlParts = relativeUrl.split("/");

    const dirsAscendingCount = urlParts.reduce((acc, val) => acc + (val === ".." ? 1 : 0), 0);
    const usableParts = urlParts.slice(dirsAscendingCount).join("/");

    const slugParts = slug.split("/");

    if (dirsAscendingCount <= slugParts.length) {
        for (let i = 0; i < dirsAscendingCount; ++i) {
            slugParts.pop();
        }
    } else {
        return `https://${domain}/${usableParts}`;
    }

    return `https://${domain}/${slugParts.length > 0 ? `${slugParts.join("/")}/` : ""}${usableParts}`;
}
