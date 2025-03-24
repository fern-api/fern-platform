import { DocsSiteNavBar } from "./DocsSiteNavBar";

export declare namespace DocsSiteLayout {
  export interface Props {
    domain: string;
    children: React.JSX.Element;
  }
}

export function DocsSiteLayout({ domain, children }: DocsSiteLayout.Props) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3">
        <div className="text-gray-1200 mb-1 text-xl font-bold dark:text-gray-200">
          {domain}
        </div>
        <div className="flex items-center gap-2 rounded-full bg-green-300 px-3 py-2">
          <div className="bg-green-1100 size-2 rounded-full" />
          <div className="text-green-1100 mb-0.5 text-sm leading-none">
            Live
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-4">
        <DocsSiteNavBar />
        <div className="flex">{children}</div>
      </div>
    </div>
  );
}
