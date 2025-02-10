import {
  HttpRequestBodyShape,
  PropertyKey,
  TypeShape,
} from "@fern-api/fdr-sdk/api-definition";

import { PlaygroundFormStateBody } from "../../types";
import { serializeFormStateBody } from "../serialize";

const STRING_VALUE_SHAPE: TypeShape = {
  type: "alias",
  value: {
    type: "primitive",
    value: {
      type: "string",
      format: undefined,
      regex: undefined,
      minLength: undefined,
      maxLength: undefined,
      default: undefined,
    },
  },
};

describe("serializeFormStateBody", () => {
  it("handles exploded form data parameters", async () => {
    const shape: HttpRequestBodyShape = {
      type: "formData",
      fields: [
        {
          type: "property",
          key: PropertyKey("tags"),
          description: undefined,
          availability: undefined,
          valueShape: STRING_VALUE_SHAPE,
          exploded: true,
          contentType: "application/json",
        },
      ],
      description: undefined,
      availability: undefined,
    };

    const body: PlaygroundFormStateBody = {
      type: "form-data",
      value: {
        tags: {
          type: "json",
          value: ["tag1", "tag2", "tag3"],
        },
      },
    };

    const result = await serializeFormStateBody(shape, body, true);

    expect(result).toEqual({
      type: "form-data",
      value: {
        tags: {
          type: "exploded",
          value: ["tag1", "tag2", "tag3"],
          contentType: "application/json",
        },
      },
    });
  });

  it("converts single value to array for exploded parameters", async () => {
    const shape: HttpRequestBodyShape = {
      type: "formData",
      fields: [
        {
          type: "property",
          key: PropertyKey("tag"),
          valueShape: STRING_VALUE_SHAPE,
          exploded: true,
          contentType: "application/json",
          description: undefined,
          availability: undefined,
        },
      ],
      description: undefined,
      availability: undefined,
    };

    const body: PlaygroundFormStateBody = {
      type: "form-data",
      value: {
        tag: {
          type: "json",
          value: "single-tag",
        },
      },
    };

    const result = await serializeFormStateBody(shape, body, true);

    expect(result).toEqual({
      type: "form-data",
      value: {
        tag: {
          type: "exploded",
          value: ["single-tag"],
          contentType: "application/json",
        },
      },
    });
  });
});
