import Image from "next/image";

import { auth0 } from "@/lib/auth0";

import { LoginPage } from "./auth/LoginPage";
import { LogoutButton } from "./auth/LogoutButton";

export async function App() {
  console.log({
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    APP_BASE_URL: process.env.APP_BASE_URL,
  });
  const session = await auth0.getSession();

  if (session == null) {
    return <LoginPage />;
  }

  const name = session.user.name;
  const picture = session.user.picture;
  const email = session.user.email;

  return (
    <div className="flex flex-1 flex-col justify-center">
      {picture != null && (
        <Image
          src={picture}
          alt={name ?? "user photo"}
          width={200}
          height={200}
        />
      )}
      <h2>{name}</h2>
      <p>{email}</p>
      <LogoutButton />
    </div>
  );
}
