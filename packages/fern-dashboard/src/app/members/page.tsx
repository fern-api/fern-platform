import { MembersPage } from "@/components/members/MembersPage";

import { getCurrentSession } from "../services/auth0/getCurrentSession";

export default async function Page() {
  const session = await getCurrentSession();
  return <MembersPage session={session} />;
}
