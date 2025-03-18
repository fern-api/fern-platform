"use client";

import Image from "next/image";

import { useUser } from "@auth0/nextjs-auth0/client";

import { LoginButton } from "./LoginButton";
import { LogoutButton } from "./LogoutButton";

export function App() {
  const { user, error, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>{error.message}</div>;
  }
  if (user == null) {
    return <LoginButton />;
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      {user.picture != null && (
        <Image
          src={user.picture}
          alt={user.name ?? "user photo"}
          width={200}
          height={200}
        />
      )}
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <LogoutButton />
    </div>
  );
}
