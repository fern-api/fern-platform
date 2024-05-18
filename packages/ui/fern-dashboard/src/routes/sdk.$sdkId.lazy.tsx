import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/sdk/$sdkId")({
    component: () => <SdkContent />,
});

const SdkContent = () => {
    const { sdkId } = Route.useParams();

    return (
        <div className="p-12">
            {/* TODO: create the top breadcrumb bar */}
            <div className="justify-between">
                <h3>Your SDKs</h3>
                <h3>Your SDKs</h3>
            </div>
        </div>
    );
};
