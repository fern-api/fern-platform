import { redirect } from "next/navigation";

import { getAuth0Client } from "@/app/services/auth0/auth0";
import { LoginPage } from "@/components/login-page/LoginPage";

export default async function Page() {
  const auth0 = await getAuth0Client();
  const session = await auth0.getSession();

  if (session == null) {
    return <LoginPage />;
  } else {
    redirect("/docs");
  }
}
