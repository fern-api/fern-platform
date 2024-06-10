import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/sdk/$sdkId/")({
    component: () => <SdkContent />,
});

const SdkContent = () => {
    const { sdkId } = Route.useParams();
    // TODO create a wrapping header
    return <>About to edit an SDK with ID: {sdkId}</>;
};
