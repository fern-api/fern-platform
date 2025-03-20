import {
  BookOpenIcon,
  CodeBracketIcon,
  CreditCardIcon,
  KeyIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

import { ThemeToggle } from "../theme/ThemeToggle";
import { SidebarItem } from "./SidebarItem";
import { SidebarSectionTitle } from "./SidebarSectionTitle";

const ICON_SIZE = "size-5";

export const Sidebar = () => {
  return (
    <div className="flex w-64 flex-col justify-between py-6 pl-4">
      <div className="flex flex-col overflow-y-auto">
        <SidebarItem
          title="Docs"
          icon={<BookOpenIcon className={ICON_SIZE} />}
          href="/docs"
        />
        <SidebarItem
          title="SDKs"
          icon={<CodeBracketIcon className={ICON_SIZE} />}
          href="/sdks"
        />
        <SidebarSectionTitle title="Settings" />
        <SidebarItem
          title="Members"
          icon={<UsersIcon className={ICON_SIZE} />}
          href="/members"
        />
        <SidebarItem
          title="API Keys"
          icon={<KeyIcon className={ICON_SIZE} />}
          href="/api-keys"
        />
        <SidebarItem
          title="Billing"
          icon={<CreditCardIcon className={ICON_SIZE} />}
          href="/billing"
        />
      </div>
      <div className="flex flex-col">
        <div className="dark:bg-gray-1100 mb-4 mr-4 h-px bg-gray-500" />
        <ThemeToggle />
      </div>
    </div>
  );
};
