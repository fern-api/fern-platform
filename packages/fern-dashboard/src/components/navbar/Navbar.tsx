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
    <div className="flex flex-col justify-between md:w-64 md:py-6 md:pl-4 lg:w-72">
      <div className="flex overflow-y-auto md:flex-col">
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
      <div className="hidden flex-col md:flex">
        <div className="dark:bg-gray-1100 mb-4 mr-4 h-px bg-gray-500" />
        <ThemeToggle />
      </div>
    </div>
  );
}
