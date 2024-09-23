import type { APIV1Read, APIV1UI } from "../client/types";

export type TypeShapeOrReference = APIV1UI.TypeShape | APIV1UI.TypeReference;
export type DereferencedTypeShape = Exclude<APIV1UI.TypeShape, APIV1UI.TypeShape.Alias>;
export type DereferencedTypeReference = Exclude<APIV1UI.TypeReference, APIV1Read.TypeReference.Id>;
export type DereferencedTypeShapeOrReference = DereferencedTypeShape | DereferencedTypeReference;
export type DereferencedNonOptionalTypeShapeOrReference = Exclude<
    DereferencedTypeShapeOrReference,
    APIV1UI.TypeReference.Optional
>;
