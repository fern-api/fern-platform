// TODO: improve the title
// function toTitle(last: ApiDefinition.KeyPathItem): string {
//     switch (last.type) {
//         case "discriminatedUnionVariant":
//             return last.discriminantDisplayName ?? titleCase(last.discriminantValue);
//         case "enumValue":
//             return last.value;
//         case "extra":
//             return "Extra Properties";
//         case "list":
//             return "List";
//         case "mapValue":
//             return "Map Value";
//         // case "meta":
//         //     return last.displayName ?? titleCase(last.value);
//         case "objectProperty":
//             return last.key;
//         case "set":
//             return "Set";
//         case "undiscriminatedUnionVariant":
//             return last.displayName ?? `Variant ${last.idx}`;
//     }
// }
