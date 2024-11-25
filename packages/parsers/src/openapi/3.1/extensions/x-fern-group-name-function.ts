// This would be used to set a member on the node, that could be used upstream
export function xFernGroupNameFunction(input: { "x-fern-group-name"?: string }): string | undefined {
    return input["x-fern-group-name"];
}
