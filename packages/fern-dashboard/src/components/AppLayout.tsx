import { Session } from "@auth0/nextjs-auth0";

import { Header } from "./Header";
import { Sidebar } from "./sidebar/Sidebar";

export declare namespace AppLayout {
  export interface Props {
    session: Session;
    children: React.JSX.Element;
  }
}

export async function AppLayout({ session, children }: AppLayout.Props) {
  return (
    <div className="dark:bg-gray-1200 flex flex-1 flex-col bg-gray-300">
      <Header session={session} />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="dark:border-gray-1100 mr-4 flex flex-1 flex-col overflow-y-auto rounded-t-2xl border border-gray-500 bg-white dark:bg-black">
          {children}
        </div>
      </div>
    </div>
  );
}
