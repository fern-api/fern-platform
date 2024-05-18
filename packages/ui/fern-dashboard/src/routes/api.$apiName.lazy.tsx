import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/api/$apiName")({
    component: () => <SdkContent />,
});

const SdkContent = () => {
    const { apiName } = Route.useParams();

    return (
        <div className="p-12">
            {/* TODO: create the top breadcrumb bar */}
            <div className="justify-between">
                <h3>Your SDKs</h3>
            </div>
        </div>
    );
};
