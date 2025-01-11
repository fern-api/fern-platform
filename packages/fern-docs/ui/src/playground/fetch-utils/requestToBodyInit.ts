import { UnreachableCaseError } from "ts-essentials";
import { ProxyRequest } from "../types/proxy";

export function toBodyInit(body: ProxyRequest["body"]): BodyInit | null {
  if (body == null) {
    return null;
  }
  switch (body.type) {
    case "json":
      return JSON.stringify(body.value);
    case "form-data": {
      const formData = new FormData();
      for (const [key, value] of Object.entries(body.value)) {
        switch (value.type) {
          case "json":
            formData.append(key, JSON.stringify(value.value));
            break;
          case "file":
            if (value.value?.dataUrl != null) {
              formData.append(key, value.value.dataUrl);
            }
            break;
          case "fileArray":
            formData.append(key, value.value.map((f) => f.dataUrl).join(","));
            break;
          default:
            console.error(new UnreachableCaseError(value));
            break;
        }
      }
      return formData;
    }
    case "octet-stream": {
      if (body.value?.dataUrl == null) {
        return null;
      }
      const blob = new Blob([body.value.dataUrl], {
        type: body.value?.type,
      });
      return blob;
    }
    default:
      console.error(new UnreachableCaseError(body));
      return null;
  }
}
