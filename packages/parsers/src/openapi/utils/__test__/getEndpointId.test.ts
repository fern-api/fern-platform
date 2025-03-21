import { getEndpointId } from "../getEndpointId";

describe("getEndpointId", () => {
  it("returns undefined when path is undefined", () => {
    expect(
      getEndpointId("namespace", undefined, "method", "opId")
    ).toBeUndefined();
  });

  it("handles string namespace", () => {
    expect(getEndpointId("pets", "/pets/get", "getById", undefined)).toBe(
      "endpoint_pets.getByIdPetsGet"
    );
  });

  it("handles array namespace", () => {
    expect(
      getEndpointId(["pets", "v1"], "/pets/get", "getById", undefined)
    ).toBe("endpoint_petsV1.getByIdPetsGet");
  });

  it("handles undefined namespace", () => {
    expect(getEndpointId(undefined, "/pets/get", "getById", undefined)).toBe(
      "endpoint_.getByIdPetsGet"
    );
  });

  it("uses operationId when sdkMethodName is undefined", () => {
    expect(getEndpointId("pets", "/pets/get", undefined, "getPetById")).toBe(
      "endpoint_pets.getPetById"
    );
  });

  it("falls back to path endpoint when no sdkMethodName or operationId", () => {
    expect(getEndpointId("pets", "/pets/get", undefined, undefined)).toBe(
      "endpoint_pets.petsGet"
    );
  });

  it("handles complex paths", () => {
    expect(
      getEndpointId(
        "pets",
        "/api/v1/pets/{petId}/details",
        "getDetails",
        undefined
      )
    ).toBe("endpoint_pets.getDetailsApiV1PetsPetIdDetails");
  });
});
