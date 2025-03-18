import Image from "next/image";

import { getSession } from "@auth0/nextjs-auth0";

import { LoginButton } from "./LoginButton";
import { LogoutButton } from "./LogoutButton";

export async function App() {
  const session = await getSession();

  if (session == null) {
    return <LoginButton />;
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
