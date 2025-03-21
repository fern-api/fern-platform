import { User } from "@auth0/nextjs-auth0/types";

import { getMyDocsSites } from "@/app/actions/getMyDocsSites";
import { auth0 } from "@/lib/auth0";

import { DocsSites } from "./DocsSites";
import DocsZeroState from "./DocsZeroState";

export default async function Docs() {
  const session = await auth0.getSession();

  let welcomeString = "Welcome";
  const firstName = session != null ? getFirstName(session.user) : undefined;
  if (firstName != null) {
    welcomeString += ", " + firstName;
  }

  const { docsSites } = await getMyDocsSites();

  return (
    <div className="flex flex-col">
      <div className="text-gray-1200 text-xl font-bold dark:text-gray-200">
        {welcomeString}
      </div>
      <div className="mt-2 text-sm text-gray-900">
        Delight your developers with gorgeous Docs.
      </div>
      <div className="mt-12">
        {docsSites.length > 0 ? (
          <DocsSites docsSites={docsSites} />
        ) : (
          <DocsZeroState />
        )}
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
