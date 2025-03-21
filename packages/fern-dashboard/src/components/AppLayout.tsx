import { SessionData } from "@auth0/nextjs-auth0/types";

import { Header } from "./Header";
import { Navbar } from "./navbar/Navbar";

export declare namespace AppLayout {
  export interface Props {
    session: SessionData;
    children: React.JSX.Element;
  }
}

export async function AppLayout({ session, children }: AppLayout.Props) {
  return (
    <div className="dark:bg-gray-1200 flex flex-1 flex-col bg-gray-300">
      <Header session={session} />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row-reverse">
        <div className="dark:border-gray-1100 mr-4 flex flex-1 justify-center overflow-y-auto rounded-t-2xl border border-gray-500 bg-white p-8 dark:bg-black">
          <div className="flex max-w-[1200px] flex-1 flex-col">{children}</div>
        </div>
        <Navbar />
      </div>
    </div>
  );
}
