import { redirect } from "next/navigation";

import { LoginPage } from "@/components/login-page/LoginPage";
import { getAuth0Client } from "@/lib/auth0";

export default async function Page() {
  const auth0 = await getAuth0Client();
  const session = await auth0.getSession();

  if (session == null) {
    return <LoginPage />;
  } else {
    redirect("/docs");
  }
}
