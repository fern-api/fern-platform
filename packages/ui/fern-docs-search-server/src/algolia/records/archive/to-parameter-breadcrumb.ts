// export function toParameterBreadcrumb(path: ApiDefinition.KeyPathItem[]): {
//     key: string;
//     display_name: string | undefined;
//     optional: boolean | undefined;
// }[] {
//     const records: {
//         key: string;
//         display_name: string | undefined;
//         optional: boolean | undefined;
//     }[] = [];

//     // don't include the last part of the path
//     path.forEach((item) => {
//         const title = toTitle(item);
//         switch (item.type) {
//             case "discriminatedUnionVariant": {
//                 // TODO: don't use the display name for discriminated unions (but this must mirror the frontend)
//                 records.push({
//                     key: item.discriminantDisplayName ?? titleCase(item.discriminantValue),
//                     display_name: title,
//                     optional: undefined,
//                 });
//                 break;
//             }
//             case "enumValue":
//                 records.push({
//                     key: item.value,
//                     display_name: title,
//                     optional: undefined,
//                 });
//                 break;
//             case "extra":
//                 records.push({
//                     key: "extra",
//                     display_name: title,
//                     optional: undefined,
//                 });
//                 break;
//             case "list":
//             case "set":
//             case "mapValue":
//                 // the frontend currently doesn't append anything for lists or sets (will this cause collisions?)
//                 break;
//             // case "meta":
//             //     slug += encodeURIComponent(item.value);
//             //     if (item.displayName) {
//             //         records.push({ title: item.displayName, slug });
//             //     }
//             //     slug += ".";
//             //     break;
//             case "objectProperty":
//                 slug += encodeURIComponent(item.key);
//                 records.push({ title, slug });
//                 slug += ".";
//                 break;
//             case "undiscriminatedUnionVariant":
//                 slug += encodeURIComponent(item.displayName ?? item.idx.toString());
//                 if (item.displayName) {
//                     records.push({ title, slug });
//                 }
//                 break;
//             default:
//                 throw new UnreachableCaseError(item);
//         }
//     });

//     return records;
// }
