import { PlusIcon } from "@heroicons/react/24/outline";

import { PageHeader } from "../layout/PageHeader";
import { Button } from "../ui/button";
import { MembersTable } from "./MembersTable";

export function MembersPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Members"
        subtitle="Manage team members and invitations"
        rightContent={
          <div className="flex items-center">
            <Button variant="outline">
              <PlusIcon />
              Add member
            </Button>
          </div>
        }
      />
      <MembersTable />
    </div>
  );
}
