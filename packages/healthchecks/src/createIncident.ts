import { IncidentClient } from "@fern-fern/incident";
import { RuleResult } from "./rules/runRules";
import { ShowResponseBody13 } from "@fern-fern/incident/api";

const INCIDENT = new IncidentClient({
    token: process.env.INCIDENT_TOKEN ?? "",
});

/**
 * Generates an incident. Does not return anything
 */
export async function createFailedDocLoadIncident(url: string, result: RuleResult): Promise<ShowResponseBody13> {
    return await INCIDENT.incidentsV2.create({
        id: Date.now() + "-" + result.name,
        idempotencyKey: result.name + url,
        mode: "standard",
        name: `rule ${result.name} failed for url ${url}`,
        summary: result.message,
        severityId: "01HR85VFNXA1RTYRR744G9FN6J",
        visibility: "public",
    });
}
