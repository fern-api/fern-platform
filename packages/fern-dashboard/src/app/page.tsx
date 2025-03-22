import { redirect } from "next/navigation";

import { LoginPage } from "@/components/LoginPage";
import { auth0 } from "@/lib/auth0";

export default async function Home() {
  const session = await auth0.getSession();

  if (session == null) {
    return <LoginPage />;
  } else {
    redirect("/docs");
  }
}
