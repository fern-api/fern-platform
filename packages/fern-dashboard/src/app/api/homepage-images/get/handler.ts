import { MaybeErrorResponse } from "../../utils/MaybeErrorResponse";

export default async function getHomepageImages({
  url,
}: {
  url: string;
}): Promise<MaybeErrorResponse> {
  // TODO generate s3 URLs
  return { data: undefined };
}
