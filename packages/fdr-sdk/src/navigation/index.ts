import { ApiDefinitionHolder } from "./ApiDefinitionHolder";
import { NavigationConfigConverter } from "./converters/NavigationConfigConverter";
import { NodeCollector } from "./NodeCollector";

const convert = NavigationConfigConverter.convert;
const collectSlugs = NodeCollector.collect;
const createApiHolder = ApiDefinitionHolder.create;

export * from "./ApiDefinitionHolder";
export { ApiReferenceNavigationConverter } from "./converters/ApiReferenceNavigationConverter";
export * from "./generated/api";
export * from "./types";
export * as utils from "./utils";
export { ApiDefinitionHolder, collectSlugs, convert, createApiHolder, NavigationConfigConverter, NodeCollector };
