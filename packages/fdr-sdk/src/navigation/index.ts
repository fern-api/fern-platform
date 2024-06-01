import { NavigationConfigConverter } from "./converters/NavigationConfigConverter";
import { SlugCollector } from "./SlugCollector";

const convert = NavigationConfigConverter.convert;
const collectSlugs = SlugCollector.collect;

export * from "./ApiDefinitionHolder";
export { ApiReferenceNavigationConverter } from "./converters/ApiReferenceNavigationConverter";
export * from "./generated/api";
export * from "./types/NavigationNode";
export * as utils from "./utils";
export * from "./visitors";
export { collectSlugs, convert };
