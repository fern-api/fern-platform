import { ApiDefinitionHolder } from "./ApiDefinitionHolder";
import { NodeCollector } from "./NodeCollector";
import { ApiReferenceNavigationConverter } from "./converters/ApiReferenceNavigationConverter";
import { ChangelogNavigationConverter } from "./converters/ChangelogConverter";
import { NavigationConfigConverter } from "./converters/NavigationConfigConverter";
import { NodeIdGenerator } from "./converters/NodeIdGenerator";
import { SlugGenerator } from "./converters/SlugGenerator";

const convert = NavigationConfigConverter.convert;
const collectSlugs = NodeCollector.collect;
const createApiHolder = ApiDefinitionHolder.create;

export * from "./ApiDefinitionHolder";
export * from "./generated/api";
export * from "./types";
export * as utils from "./utils";
export {
    ApiDefinitionHolder,
    ApiReferenceNavigationConverter,
    ChangelogNavigationConverter,
    NavigationConfigConverter,
    NodeCollector,
    NodeIdGenerator,
    SlugGenerator,
    collectSlugs,
    convert,
    createApiHolder,
};
