import { noop } from "ts-essentials";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../utils/extendType";
import { X_FERN_GROUPS } from "./fernExtension.consts";

export declare namespace XFernGroupsConverterNode {
  export interface Group {
    description?: string;
    summary?: string;
  }

<<<<<<< HEAD
    export interface Input {
        [X_FERN_GROUPS]?: Record<string, Group>[];
    }
=======
  export interface Input {
    [X_FERN_GROUPS]?: Record<string, Group>[];
  }
>>>>>>> main
}

export class XFernGroupsConverterNode extends BaseOpenApiV3_1ConverterNode<
  unknown,
  void
> {
  groups?: Record<string, XFernGroupsConverterNode.Group>[];

  constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
    super(args);
    this.safeParse();
  }

<<<<<<< HEAD
    parse(): void {
        this.groups = extendType<XFernGroupsConverterNode.Input>(this.input)[X_FERN_GROUPS];
    }
=======
  parse(): void {
    this.groups = extendType<XFernGroupsConverterNode.Input>(this.input)[
      X_FERN_GROUPS
    ];
  }
>>>>>>> main

  convert(): void | undefined {
    noop();
  }
}
