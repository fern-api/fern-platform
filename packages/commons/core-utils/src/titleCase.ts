import title from "title";

import { SPECIAL_TOKENS } from "./specialTokens";

export function titleCase(name: string): string {
  // regex match pascalCase or CamelCase and add spaces between words
  name = name.replace(/([a-z])([A-Z])/g, "$1 $2");

  // regex match snake_case and replace "_" with " "
  name = name.replace(/_/g, " ");

  // regex match kebab-case and replace "-" with " "
  name = name.replace(/-/g, " ");

  const titleCased = title(name, { special: SPECIAL_TOKENS });

  // regex match "V 2", "V 4", etc. and replace it with "V2", "V4", etc.
  const versionedTitle = titleCased.replace(/V\s(\d)/g, "V$1");
  return versionedTitle;
}

export default titleCase;
