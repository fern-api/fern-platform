import { getSessionOrRedirect } from "@/utils/auth0";

import { Navbar } from "../navbar/Navbar";
import { Header } from "./Header";
import { Footer } from "./footer/Footer";

export declare namespace AppLayout {
  export interface Props {
    children: React.JSX.Element;
  }
}

export async function AppLayout({ children }: AppLayout.Props) {
  const session = await getSessionOrRedirect();

  return (
    <div className="dark:bg-gray-1200 flex flex-1 flex-col bg-gray-300">
      <Header session={session} />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row-reverse">
        <div className="dark:border-gray-1100 flex flex-1 justify-center overflow-y-auto border border-gray-500 bg-white px-12 pt-12 md:mr-4 md:rounded-t-2xl dark:bg-black">
          <div className="flex max-w-[1200px] flex-1 flex-col">
            <div className="flex flex-1">{children}</div>
            <div className="py-12">
              <Footer />
            </div>
          </div>
        </div>
        <Navbar />
      </div>
    </div>
  );
}
