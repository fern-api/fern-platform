import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
    component: Index,
});

function Index() {
    return (
        <div className="p-12">
            <div className="justify-between"></div>
            <h3>Welcome Home!</h3>
        </div>
    );
}
