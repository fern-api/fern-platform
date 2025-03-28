import { MembersPage } from "@/components/members/MembersPage";
import { getSessionOrRedirect } from "@/utils/auth0";

export default async function Page() {
  const session = await getSessionOrRedirect();
  return <MembersPage session={session} />;
}
