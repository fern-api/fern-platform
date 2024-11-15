export function toFiltersString(filters: { facet: string; value: string }[]): string {
    return filters
        .map((filter) => `${filter.facet}:"${filter.value}"`)
        .sort()
        .join(" AND ");
}
