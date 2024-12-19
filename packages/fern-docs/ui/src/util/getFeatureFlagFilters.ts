// TODO: Remove this file once the feature flag is removed

export function getFeatureFlagFilters(enabled: boolean): string {
  const filters =
    "type: 'endpoint-v4' OR type: 'websocket-v4' OR type: 'webhook-v4' OR type: 'page-v4' OR type: 'endpoint-field-v1' OR type: 'websocket-field-v1' OR type: 'webhook-field-v1' OR type: 'markdown-section-v1'";
  return enabled
    ? filters
    : filters
        .split(" OR ")
        .map((filter) => `NOT ${filter}`)
        .join(" AND ");
}
