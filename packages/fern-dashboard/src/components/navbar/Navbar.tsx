import {
  CodeBracketIcon,
  CreditCardIcon,
  KeyIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

import { ThemeToggle } from "../theme/ThemeToggle";
import { DocsNavbarItems } from "./DocsNavbarItems";
import { ICON_SIZE, NavbarItem } from "./NavbarItem";
import { NavbarSectionTitle } from "./NavbarSectionTitle";

export function Navbar() {
  return (
    <div className="flex flex-col justify-between sm:w-64 sm:py-6 sm:pl-4 lg:w-72">
      <div className="flex overflow-y-auto sm:flex-col">
        <DocsNavbarItems />
        <NavbarItem
          title="SDKs"
          icon={<CodeBracketIcon className={ICON_SIZE} />}
          href="/sdks"
        />
        <NavbarSectionTitle title="Settings" />
        <NavbarItem
          title="Members"
          icon={<UsersIcon className={ICON_SIZE} />}
          href="/members"
        />
        <NavbarItem
          title="API Keys"
          icon={<KeyIcon className={ICON_SIZE} />}
          href="/api-keys"
        />
        <NavbarItem
          title="Billing"
          icon={<CreditCardIcon className={ICON_SIZE} />}
          href="/billing"
        />
      </div>
      <div className="hidden flex-col sm:flex">
        <div className="dark:bg-gray-1100 mb-4 mr-4 h-px bg-gray-500" />
        <ThemeToggle />
      </div>
    </div>
  );
}
