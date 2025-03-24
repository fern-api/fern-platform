import { SessionData } from "@auth0/nextjs-auth0/types";

import { Header } from "./header/Header";
import { Navbar } from "./navbar/Navbar";

export declare namespace AppLayout {
  export interface Props {
    session: SessionData;
    currentDocsDomain?: string;
    children: React.JSX.Element;
  }
}

export async function AppLayout({
  session,
  currentDocsDomain,
  children,
}: AppLayout.Props) {
  return (
    <div className="dark:bg-gray-1200 flex flex-1 flex-col bg-gray-300">
      <Header session={session} currentDocsDomain={currentDocsDomain} />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row-reverse">
        <div className="dark:border-gray-1100 flex flex-1 justify-center overflow-y-auto border border-gray-500 bg-white p-8 md:mr-4 md:rounded-t-2xl dark:bg-black">
          <div className="flex max-w-[1200px] flex-1 flex-col">{children}</div>
        </div>
        <Navbar />
      </div>
    </div>
  );
}
