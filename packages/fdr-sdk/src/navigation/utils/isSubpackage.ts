import type { APIV1Read } from "../../client/types";

export function isSubpackage(
  package_: APIV1Read.ApiDefinitionPackage
): package_ is APIV1Read.ApiDefinitionSubpackage {
  return (
    typeof (package_ as APIV1Read.ApiDefinitionSubpackage).subpackageId ===
    "string"
  );
}
