import type * as Latest from "./latest";

export type TypeShapeOrReference = Latest.TypeShape | Latest.TypeReference;
export type DereferencedTypeShape = Exclude<
  Latest.TypeShape,
  Latest.TypeShape.Alias
>;
export type DereferencedTypeReference = Exclude<
  Latest.TypeReference,
  Latest.TypeReference.Id
>;
export type DereferencedTypeShapeOrReference =
  | DereferencedTypeShape
  | DereferencedTypeReference;
export type DereferencedNonOptionalTypeShapeOrReference = Exclude<
  DereferencedTypeShapeOrReference,
  Latest.TypeReference.Optional
>;
