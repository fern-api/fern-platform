import { IncidentClient } from "@fern-fern/incident";
import { ShowResponseBody13 } from "@fern-fern/incident/api";
import { RuleResult } from "./rules/runRules";

const INCIDENT = new IncidentClient({
    token: process.env.INCIDENT_TOKEN ?? "",
});

/**
 * Generates an incident. Does not return anything
 */
export async function createFailedDocLoadIncident(failedResults: RuleResult[]): Promise<ShowResponseBody13> {
    return await INCIDENT.incidentsV2.create({
        id: `${Date.now()} fern-platform-health-check-failure`,
        idempotencyKey: "fern-platform-health-check-failure",
        mode: "test",
        name: "fern platform health checks have failed",
        summary: `These are the health checks that failed: ${failedResults.map((result) => formatResult(result)).flat()}`,
        severityId: "01HR85VFNXA1RTYRR744G9FN6J",
        visibility: "public",
    });
}

function formatResult(result: RuleResult): string {
    return `rule ${result.name} for url ${result.url} ${result.success ? "succeeded" : "failed"} -- ${result.message}`;
}
