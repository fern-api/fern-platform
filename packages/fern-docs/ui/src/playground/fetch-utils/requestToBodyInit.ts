import { UnreachableCaseError } from "ts-essentials";
import { ProxyRequest } from "../types/proxy";

export async function toBodyInit(
  body: ProxyRequest["body"]
): Promise<BodyInit | null> {
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
          case "json": {
            if (value.value !== undefined) {
              formData.append(
                key,
                value.contentType
                  ? new Blob([JSON.stringify(value.value)], {
                      type: value.contentType,
                    })
                  : JSON.stringify(value.value)
              );
            }
            break;
          }
          case "file":
            if (value.value?.dataUrl != null) {
              const response = await fetch(value.value.dataUrl);
              const blob = await response.blob();
              formData.append(key, blob, value.value.name);
            }
            break;
          case "fileArray":
            for (const file of value.value) {
              if (file?.dataUrl != null) {
                const response = await fetch(file.dataUrl);
                const blob = await response.blob();
                formData.append(key, blob, file.name);
              }
            }
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
