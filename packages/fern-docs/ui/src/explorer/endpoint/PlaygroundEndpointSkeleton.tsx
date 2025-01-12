import { FernButton } from "@fern-docs/components";
import { Badge } from "@fern-docs/components/badges";
import * as Dialog from "@radix-ui/react-dialog";
import { Xmark } from "iconoir-react";
import { ReactElement } from "react";
import { noop } from "ts-essentials";
import { ExplorerSendRequestButton } from "../ExplorerSendRequestButton";
import { ExplorerCardSkeleton } from "./ExplorerCardSkeleton";
import { ExplorerEndpointContentLayout } from "./ExplorerEndpointContentLayout";
import { ExplorerEndpointFormSectionSkeleton } from "./ExplorerEndpointFormSectionSkeleton";

function ExplorerEndpointPath() {
  return (
    <div className="explorer-endpoint">
      <div className="bg-tag-default flex h-10 min-w-0 flex-1 shrink items-center gap-2 rounded-lg px-4 py-2 max-sm:h-8 max-sm:px-2 max-sm:py-1 sm:rounded-[20px]">
        <Badge className="explorer-endpoint-method" skeleton>
          POST
        </Badge>
      </div>

      <div className="max-sm:hidden">
        <ExplorerSendRequestButton />
      </div>

      <Dialog.Close asChild className="max-sm:hidden">
        <FernButton icon={<Xmark />} size="large" rounded variant="outlined" />
      </Dialog.Close>
    </div>
  );
}

export function ExplorerEndpointSkeleton(): ReactElement {
  const form = (
    <div className="mx-auto w-full max-w-5xl space-y-6 pt-6 max-sm:pt-0 sm:pb-20">
      <div className="col-span-2 space-y-8">
        <ExplorerEndpointFormSectionSkeleton />
        <ExplorerEndpointFormSectionSkeleton />
      </div>
    </div>
  );
  return (
    <div className="flex size-full min-h-0 flex-1 shrink flex-col">
      <div className="flex-0">
        <ExplorerEndpointPath />
      </div>
      <div className="flex min-h-0 flex-1 shrink">
        <ExplorerEndpointContentLayout
          sendRequest={noop}
          form={form}
          requestCard={<ExplorerCardSkeleton className="flex-1" />}
          responseCard={<ExplorerCardSkeleton className="flex-1" />}
        />
      </div>
    </div>
  );
}
