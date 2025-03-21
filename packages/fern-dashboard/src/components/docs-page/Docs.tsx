import Image from "next/image";

import { User } from "@auth0/nextjs-auth0/types";
import { PlusIcon } from "@heroicons/react/24/outline";

import { auth0 } from "@/lib/auth0";

import exampleDocsSite from "../../../public/example-docs-site.avif";
import { Button } from "../ui/button";

export default async function Docs() {
  const session = await auth0.getSession();

  let welcomeString = "Welcome";
  const firstName = session != null ? getFirstName(session.user) : undefined;
  if (firstName != null) {
    welcomeString += ", " + firstName;
  }

  return (
    <div className="flex flex-col">
      <div className="text-gray-1200 text-xl font-bold dark:text-gray-200">
        {welcomeString}
      </div>
      <div className="mt-2 text-sm text-gray-900">
        Delight your developers with gorgeous Docs.
      </div>
      <div className="dark:border-gray-1100 my-12 flex h-[300px] justify-center overflow-hidden border-b border-gray-700">
        <div className="relative mx-[5%] flex max-w-[700px] flex-1 justify-center">
          <Image
            className="absolute top-0"
            src={exampleDocsSite}
            alt="example doc site"
          />
        </div>
      </div>
      <div className="flex justify-center">
        <Button>
          <PlusIcon />
          Create your first Docs site
        </Button>
      </div>
    </div>
  );
}

function getFirstName(user: User) {
  if (user.given_name != null) {
    return user.given_name;
  }
  if (user.name != null) {
    return user.name.split(" ")[0];
  }
  return undefined;
}
