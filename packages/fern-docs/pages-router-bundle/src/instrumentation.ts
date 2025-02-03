import { OTLPHttpJsonTraceExporter, registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName: "fern-docs",
    traceExporter: new OTLPHttpJsonTraceExporter({
      url: "https://otel.highlight.io:4318/v1/traces",
    }),
    attributes: {
      "highlight.project_id": process.env.HIGHLIGHT_PROJECT_ID_FERN_APP,
    },
  });
}
