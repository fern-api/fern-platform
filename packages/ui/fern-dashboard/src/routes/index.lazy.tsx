import { DummyApis } from "@/components/sdks/mock-data/Api";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
    component: Index,
});

function Index() {
    // For now we want to always redirect users to their API, prioritizing
    // single API management
    const navigate = useNavigate();
    // [Data] TODO: fetch APIs and redirect to the first one
    navigate({ to: "/api/$apiId", params: { apiId: DummyApis[0].id } });
    return;
}
