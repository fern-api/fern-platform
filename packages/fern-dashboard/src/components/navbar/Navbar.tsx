import {
  BookOpenIcon,
  CodeBracketIcon,
  CreditCardIcon,
  KeyIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

import { ThemeToggle } from "../theme/ThemeToggle";
import { DocsNavbarSubItems } from "./DocsNavbarSubItems";
import { NavbarItem } from "./NavbarItem";
import { NavbarSectionTitle } from "./NavbarSectionTitle";

const ICON_SIZE = "size-5";

export const Navbar = () => {
  return (
    <div className="flex flex-col justify-between md:w-64 md:py-6 md:pl-4">
      <div className="flex overflow-y-auto md:flex-col">
        <NavbarItem
          title="Docs"
          icon={<BookOpenIcon className={ICON_SIZE} />}
          href="/docs"
        />
        <DocsNavbarSubItems />
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
};
