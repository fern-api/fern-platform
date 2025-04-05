import { redirect } from "next/navigation";

import { getCurrentSession } from "../../services/auth0/getCurrentSession";

export default async function TokenPage() {
  const { session } = await getCurrentSession();

  if (session == null) {
    redirect("/");
  }

  return (
    <div className="flex items-center justify-center">
      <code className="break-all">{session.tokenSet.accessToken}</code>
    </div>
  );
}
