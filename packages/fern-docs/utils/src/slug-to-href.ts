import { addLeadingSlash } from "./leading-slash";
import { conformTrailingSlash } from "./trailing-slash";

export function slugToHref(slug: string): string {
  return conformTrailingSlash(addLeadingSlash(slug));
}
