import { isNonNullish } from "@fern-api/ui-core-utils";
import { FernRegistry } from "../../../client/generated";
import { ParameterBaseObjectConverterNode, SchemaConverterNode } from "../../3.1";

export function convertToObjectProperties(
    properties: Record<string, SchemaConverterNode | ParameterBaseObjectConverterNode> | undefined,
    requiredProperties: string[] | undefined,
): FernRegistry.api.latest.ObjectProperty[] | undefined {
    if (properties == null) {
        return undefined;
    }

    return Object.entries(properties)
        .map(([key, node]) => {
            let valueShape = node.convert();
            if (valueShape == null) {
                return undefined;
            }

            if (requiredProperties != null && !requiredProperties.includes(key)) {
                valueShape = {
                    type: "alias",
                    value: {
                        type: "optional",
                        shape: valueShape,
                        default: valueShape.type === "enum" ? valueShape.default : undefined,
                    },
                };
            }

            return {
                key: FernRegistry.PropertyKey(key),
                valueShape,
                description: node.description,
                availability: node.availability?.convert(),
            };
        })
        .filter(isNonNullish);
}
