import { headers } from "next/headers";

export async function getAppUrlServerSide() {
  const headersList = await headers();

  const host = headersList.get("host");
  if (host == null) {
    throw new Error("host header is not present");
  }

  const protocol = headersList.get("x-forwarded-proto") ?? "https";

  return `${protocol}://${host}`;
}
