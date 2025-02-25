import { camelCase } from "es-toolkit/compat";
import { getEndpointId } from "../getEndpointId";

describe("getEndpointId", () => {
  it("returns undefined when path is undefined", () => {
    expect(
      getEndpointId({
        namespace: "namespace",
        path: undefined,
        method: "method",
        sdkMethodName: "opId",
        operationId: undefined,
        displayName: undefined,
        isWebhook: undefined,
      })
    ).toBeUndefined();
  });

  it("handles string namespace", () => {
    expect(
      getEndpointId({
        namespace: "pets",
        path: "/pets/get",
        method: "getById",
        sdkMethodName: undefined,
        operationId: undefined,
        displayName: undefined,
        isWebhook: undefined,
      })
    ).toBe("endpoint_pets.getByIdPetsGet");
  });

  it("handles array namespace", () => {
    expect(
      getEndpointId({
        namespace: ["pets", "v1"],
        path: "/pets/get",
        method: "getById",
        sdkMethodName: undefined,
        operationId: undefined,
        displayName: undefined,
        isWebhook: undefined,
      })
    ).toBe("endpoint_pets/v1.getByIdPetsGet");
  });

  it("handles undefined namespace", () => {
    expect(
      getEndpointId({
        namespace: undefined,
        path: "/pets/get",
        method: "getById",
        sdkMethodName: undefined,
        operationId: undefined,
        displayName: undefined,
        isWebhook: undefined,
      })
    ).toBe("endpoint_.getByIdPetsGet");
  });

  it("uses operationId when sdkMethodName is undefined", () => {
    expect(
      getEndpointId({
        namespace: "pets",
        path: "/pets/get",
        method: undefined,
        sdkMethodName: undefined,
        operationId: "getPetById",
        displayName: undefined,
        isWebhook: undefined,
      })
    ).toBe("endpoint_pets.getPetById");
  });

  it("falls back to path endpoint when no sdkMethodName or operationId", () => {
    expect(
      getEndpointId({
        namespace: "pets",
        path: "/pets/get",
        method: undefined,
        sdkMethodName: undefined,
        operationId: undefined,
        displayName: undefined,
        isWebhook: undefined,
      })
    ).toBe("endpoint_pets.petsGet");
  });

  it("handles complex paths", () => {
    expect(
      getEndpointId({
        namespace: "pets",
        path: "/api/v1/pets/{petId}/details",
        method: "getDetails",
        sdkMethodName: undefined,
        operationId: undefined,
        displayName: undefined,
        isWebhook: undefined,
      })
    ).toBe("endpoint_pets.getDetailsApiV1PetsPetIdDetails");
  });

  it("uses displayName when it is provided", () => {
    expect(
      getEndpointId({
        namespace: "pets",
        path: "/pets/get",
        method: "getById",
        sdkMethodName: undefined,
        operationId: undefined,
        displayName: "Get Pet By Id",
        isWebhook: undefined,
      })
    ).toBe("endpoint_pets.getPetById");
  });

  it("handles apostrophe in displayName", () => {
    console.log(camelCase("Get Pet's By Id"));
    expect(
      getEndpointId({
        namespace: "pets",
        path: "/pets/get",
        method: "getById",
        sdkMethodName: undefined,
        operationId: undefined,
        displayName: "Get Pet's By Id",
        isWebhook: undefined,
      })
    ).toBe("endpoint_pets.getPetsById");
  });
});
