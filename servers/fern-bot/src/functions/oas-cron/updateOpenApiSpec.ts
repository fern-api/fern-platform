import { handlerWrapper } from "@libs/handler-wrapper";

const updateOpenApiSpec = async (event: unknown) => {
    return event;
};

export const handler = handlerWrapper(updateOpenApiSpec);
