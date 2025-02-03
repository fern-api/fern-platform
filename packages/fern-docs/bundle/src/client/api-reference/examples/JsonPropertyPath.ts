export type JsonPropertyPath = readonly JsonPropertyPathPart[];

export type JsonPropertyPathPart =
  | JsonPropertyPathPart.ObjectProperty
  | JsonPropertyPathPart.ObjectFilter
  | JsonPropertyPathPart.ListItem;

export declare namespace JsonPropertyPathPart {
  export interface ObjectProperty {
    type: "objectProperty";
    // if absent, any property is matched
    propertyName?: string;
  }

  /**
   * TODO: support more than just string values (e.g. other primitives)
   */
  export interface ObjectFilter {
    type: "objectFilter";
    propertyName: string;
    requiredStringValue: string;
  }

  export interface ListItem {
    type: "listItem";
    // if absent, any item is matched
    index?: number;
  }
}
