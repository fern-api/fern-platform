import { redirect } from "next/navigation";

import { getSession } from "@auth0/nextjs-auth0";

import { LoginPage } from "@/components/LoginPage";

export default async function Home() {
  const session = await getSession();

  if (session == null) {
    return <LoginPage />;
  } else {
    redirect("/docs");
  }
}
