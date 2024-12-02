import { FernRegistry } from "../client/generated";

export type FdrNumberType = FernRegistry.api.v1.read.PrimitiveType.Double;
export type FdrIntegerType =
    | FernRegistry.api.v1.read.PrimitiveType.Integer
    | FernRegistry.api.v1.read.PrimitiveType.Long
    | FernRegistry.api.v1.read.PrimitiveType.Uint
    | FernRegistry.api.v1.read.PrimitiveType.Uint64;
export type FdrStringType =
    | FernRegistry.api.v1.read.PrimitiveType.String
    | FernRegistry.api.v1.read.PrimitiveType.BigInteger
    | FernRegistry.api.v1.read.PrimitiveType.Datetime
    | FernRegistry.api.v1.read.PrimitiveType.Uuid
    | FernRegistry.api.v1.read.PrimitiveType.Base64
    | FernRegistry.api.v1.read.PrimitiveType.Date_;
