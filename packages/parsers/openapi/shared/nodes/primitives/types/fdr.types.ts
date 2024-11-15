import { FdrAPI } from "@fern-api/fdr-sdk";

export type FdrFloatType = FdrAPI.api.v1.read.PrimitiveType.Double;
export type FdrIntegerType =
    | FdrAPI.api.v1.read.PrimitiveType.Integer
    | FdrAPI.api.v1.read.PrimitiveType.Long
    | FdrAPI.api.v1.read.PrimitiveType.Uint
    | FdrAPI.api.v1.read.PrimitiveType.Uint64;
export type FdrStringType =
    | FdrAPI.api.v1.read.PrimitiveType.String
    | FdrAPI.api.v1.read.PrimitiveType.BigInteger
    | FdrAPI.api.v1.read.PrimitiveType.Datetime
    | FdrAPI.api.v1.read.PrimitiveType.Uuid
    | FdrAPI.api.v1.read.PrimitiveType.Base64
    | FdrAPI.api.v1.read.PrimitiveType.Date_;
