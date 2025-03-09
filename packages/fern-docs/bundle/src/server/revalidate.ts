import "server-only";

import { after } from "next/server";

export function revalidate(baseUrl: string) {
  return after(async () => {
    await fetch(`${baseUrl}/api/fern-docs/revalidate`);
  });
}
