/**
 *
 * we want to get the lowest level of breadcrumbs shared by all groups
 * for example:
 * - [a, b, c]
 * - [a, b, d]
 *
 * the shared breadcrumbs would be [a, b], and the resulting breadcrumbs for each group would be [c] and [d]
 *
 * @internal
 */
export function arraylcd(
    input: readonly (readonly string[])[]
): readonly string[] {
    return input.reduce<readonly string[]>((acc, breadcrumbs) => {
        return acc.filter((breadcrumb, idx) => breadcrumb === breadcrumbs[idx]);
    }, input[0] ?? []);
}

interface BreadcrumbSlicerOpts<T> {
    selectBreadcrumb: (el: T) => readonly string[];
    updateBreadcrumb: (el: T, breadcrumb: readonly string[]) => T;
}

/**
 * assumes that elements are ordered via pre-order traversal of a navigation tree.
 *
 * if the breadcrumbs of the list looks like this:
 * [a, b]
 * [a, b, c]
 * [a, b, d]
 * [a, b, d, f]
 *
 * then the resulting list of elements will be:
 * []
 * [c]
 * [d]
 * [d, f]
 */
export function createBreadcrumbSlicer<T>({
    selectBreadcrumb,
    updateBreadcrumb,
}: BreadcrumbSlicerOpts<T>): (elements: T[]) => T[] {
    return (elements: T[]) => {
        const breadcrumbs = elements.map(selectBreadcrumb);

        const firstBreadcrumb = breadcrumbs[0];
        if (firstBreadcrumb == null) {
            return elements;
        }

        let start = arraylcd(breadcrumbs).length;
        if (start === 0) {
            return elements;
        }

        const firstDescendantIdx = breadcrumbs.findIndex(
            (breadcrumb) => breadcrumb.length > firstBreadcrumb.length
        );
        const shortestDescendent = Math.min(
            ...breadcrumbs
                .slice(firstDescendantIdx)
                .map((breadcrumb) => breadcrumb.length)
        );
        if (shortestDescendent === 0) {
            return elements;
        }

        if (shortestDescendent <= start) {
            start = shortestDescendent - 1;
        }

        return elements.map((element) =>
            updateBreadcrumb(element, selectBreadcrumb(element).slice(start))
        );
    };
}
