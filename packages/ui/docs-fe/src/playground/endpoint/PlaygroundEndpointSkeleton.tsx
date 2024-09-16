import { FernButton } from "@fern-ui/components";
import * as Dialog from "@radix-ui/react-dialog";
import { Xmark } from "iconoir-react";
import { ReactElement } from "react";
import { noop } from "ts-essentials";
import { HttpMethodTag } from "../../components/HttpMethodTag";
import { PlaygroundSendRequestButton } from "../PlaygroundSendRequestButton";
import { PlaygroundCardSkeleton } from "./PlaygroundCardSkeleton";
import { PlaygroundEndpointContentLayout } from "./PlaygroundEndpointContentLayout";
import { PlaygroundEndpointFormSectionSkeleton } from "./PlaygroundEndpointFormSectionSkeleton";

function PlaygroundEndpointPath() {
    return (
        <div className="playground-endpoint">
            <div className="bg-tag-default flex h-10 min-w-0 flex-1 shrink items-center gap-2 rounded-lg px-4 py-2 max-sm:h-8 max-sm:px-2 max-sm:py-1 sm:rounded-[20px]">
                <HttpMethodTag method="POST" className="playground-endpoint-method" skeleton />
            </div>

            <div className="max-sm:hidden">
                <PlaygroundSendRequestButton />
            </div>

            <Dialog.Close asChild className="max-sm:hidden">
                <FernButton icon={<Xmark />} size="large" rounded variant="outlined" />
            </Dialog.Close>
        </div>
    );
}

export function PlaygroundEndpointSkeleton(): ReactElement {
    const form = (
        <div className="mx-auto w-full max-w-5xl space-y-6 pt-6 max-sm:pt-0 sm:pb-20">
            <div className="col-span-2 space-y-8">
                <PlaygroundEndpointFormSectionSkeleton />
                <PlaygroundEndpointFormSectionSkeleton />
            </div>
        </div>
    );
    return (
        <div className="flex size-full min-h-0 flex-1 shrink flex-col">
            <div className="flex-0">
                <PlaygroundEndpointPath />
            </div>
            <div className="flex min-h-0 flex-1 shrink">
                <PlaygroundEndpointContentLayout
                    sendRequest={noop}
                    form={form}
                    requestCard={<PlaygroundCardSkeleton className="flex-1" />}
                    responseCard={<PlaygroundCardSkeleton className="flex-1" />}
                />
            </div>
        </div>
    );
}
